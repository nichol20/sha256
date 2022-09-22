 const hashValues = [
  '6a09e667',
  'bb67ae85',
  '3c6ef372',
  'a54ff53a',
  '510e527f',
  '9b05688c',
  '1f83d9ab',
  '5be0cd19',
]
const roundConstants = [
  '428a2f98', '71374491', 'b5c0fbcf', 'e9b5dba5', '3956c25b', '59f111f1', '923f82a4', 'ab1c5ed5',
  'd807aa98', '12835b01', '243185be', '550c7dc3', '72be5d74', '80deb1fe', '9bdc06a7', 'c19bf174',
  'e49b69c1', 'efbe4786', '0fc19dc6', '240ca1cc', '2de92c6f', '4a7484aa', '5cb0a9dc', '76f988da',
  '983e5152', 'a831c66d', 'b00327c8', 'bf597fc7', 'c6e00bf3', 'd5a79147', '06ca6351', '14292967',
  '27b70a85', '2e1b2138', '4d2c6dfc', '53380d13', '650a7354', '766a0abb', '81c2c92e', '92722c85',
  'a2bfe8a1', 'a81a664b', 'c24b8b70', 'c76c51a3', 'd192e819', 'd6990624', 'f40e3585', '106aa070',
  '19a4c116', '1e376c08', '2748774c', '34b0bcb5', '391c0cb3', '4ed8aa4a', '5b9cca4f', '682e6ff3',
  '748f82ee', '78a5636f', '84c87814', '8cc70208', '90befffa', 'a4506ceb', 'bef9a3f7', 'c67178f2',
]
const twoToThePowerOf32 = 2**32

function rightrotate(binary, numberOfRotations) {
  let newBinary = binary.split('')
  for(let i=0; i < numberOfRotations; i++) {
    const lastChar = newBinary[binary.length - 1]
    
    newBinary.splice(binary.length - 1, 1)
    newBinary.splice(0, 0, lastChar)
  }

  return newBinary.join('')
}

function rightshift(binary, numberOfShifts) {
  let newBinary = binary.split('')
  for(let i=0; i < numberOfShifts; i++) {
    newBinary.pop()
    newBinary.unshift('0')
  }
  return newBinary.join('')
}

function xor(...binaries) {
  let finalBinary = binaries[0]
  binaries.forEach((currentBinary, index) => {
    if(index === 0) return

    const a = finalBinary.split('')
    const b = currentBinary.split('')
    
    finalBinary = ''

    a.forEach((t, i) => {
      if(t === b[i]) finalBinary += '0'
      else if( t !== b[i]) finalBinary += '1'
    })
  })

  return finalBinary
}

function and(...binaries) {
  let finalBinary = binaries[0]
  binaries.forEach((currentBinary, index) => {
    if(index === 0) return

    const a = finalBinary.split('')
    const b = currentBinary.split('')
    
    finalBinary = ''

    a.forEach((t, i) => {
      if(t !== '0' && b[i] !== '0') finalBinary += '1'
      else finalBinary += '0'
    })
  })

  return finalBinary
}

function not(binary) {
  let finalBinary = ''
  binary.split('').forEach(b => {
    if(b === '1') finalBinary += '0'
    else if(b === '0') finalBinary += '1'
  })
  return finalBinary
}

function additionModulo232(...binaries) {
  let finalBinary = binaries[0]
  binaries.forEach((currentBinary, index) => {
    if(index === 0) return

    const a = parseInt(finalBinary, 2)
    const b = parseInt(currentBinary, 2)
    let c = a + b

    while(c >= twoToThePowerOf32) {
      c -= twoToThePowerOf32
    }

    finalBinary = number2Binary(c)
    for(let i=finalBinary.length; i < 32; i++){
      finalBinary = '0' + finalBinary
    }
  })

  return finalBinary
}

function text2BinaryArray(text) {
  return text.split('').map(t => {
    let binary = t.charCodeAt(0).toString(2)
    for(let i=binary.length; i < 8; i++) {
      binary = '0' + binary
    }
    return binary
  })
}

function number2Binary(number) {
  return number.toString(2)
}

function binary2HexOfLength8(binary) {
  let hex = parseInt(binary, 2).toString(16)
  for(let i=hex.length; i < 8; i++) {
    hex = '0' + hex
  }
  return hex
}

function hexTo32BitBinary(hex) {
  let binary = parseInt(hex, 16).toString(2)
  for(let i=binary.length; i< 32; i++){
    binary = '0' + binary
  }
  return binary
}

function calculateMessageLengthValueInBinary(messageInBinary) {
  let lengthInBinary = number2Binary(messageInBinary.length * 8)
  for(let i=lengthInBinary.length; i < 64; i++) {
    lengthInBinary = '0' + lengthInBinary
  }
  return lengthInBinary
}

function initInput(messageInBinary) {
  const length = (messageInBinary.length * 8) + 1 + 64
  let binaryMessage = messageInBinary.reduce((accumulator, binary) => accumulator += binary, '') + '1'

  for(let i=length; i%512 !== 0; i++) {
    binaryMessage += '0'
  }

  return binaryMessage + messageLengthInBinary
}

function generateHash(input) {
  const chunks = []

  for(let i=0; i < input.length; i += 512) {
    chunks.push(input.substring(i, i+512))
  }

  const chunksWith64Words = chunks.map(c => {
    const words = []

    for(let i=0; i < c.length; i+=32) {
      words.push(c.substring(i, i + 32))
    }

    // s0 = (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift 3)
    // s1 = (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
    // w[i] = (w[i-16] + s0 + w[i-7] + s1) -> addition modulo 2^32

    for(let i=16; i < 64; i++) {
      const s0 = xor(rightrotate(words[i-15], 7), rightrotate(words[i-15], 18), rightshift(words[i-15], 3))
      const s1 = xor(rightrotate(words[i-2], 17), rightrotate(words[i-2], 19), rightshift(words[i-2], 10))
      words[i] = additionModulo232(words[i-16], s0, words[i-7], s1)
    }

    return words
  })

  // s0 = (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
  // ch = (e and f) xor ((not e) and g)
  // t0 = h + s0 + ch + k[i] + w[i]
  // s1 = (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
  // maj = (a and b) xor (a and c) xor (b and c)
  // t1 = s1 + maj
  // h = g
  // g = f
  // f = e
  // e = d + t0
  // d = c
  // c = b
  // b = a
  // a = t0 + t1

  const hash = hashValues

  chunksWith64Words.forEach((words, index) => {
    let a = hexTo32BitBinary(hash[0])
    let b = hexTo32BitBinary(hash[1])
    let c = hexTo32BitBinary(hash[2])
    let d = hexTo32BitBinary(hash[3])
    let e = hexTo32BitBinary(hash[4])
    let f = hexTo32BitBinary(hash[5])
    let g = hexTo32BitBinary(hash[6])
    let h = hexTo32BitBinary(hash[7])

    // console.table([a, b, c, d, e, f, g, h, index])
    for(let i=0; i < 64; i++) {
      const s0 = xor(rightrotate(e, 6), rightrotate(e, 11), rightrotate(e, 25))
      const ch = xor(and(e, f), and(not(e), g))
      const t0 = additionModulo232(h, s0, ch, hexTo32BitBinary(roundConstants[i]), words[i])
      const s1 = xor(rightrotate(a, 2), rightrotate(a, 13), rightrotate(a, 22))
      const maj = xor(and(a, b), and(a, c), and(b, c))
      const t1 = additionModulo232(s1, maj)

      h = g
      g = f
      f = e
      e = additionModulo232(d, t0)
      d = c
      c = b
      b = a
      a = additionModulo232(t0, t1)
    }

    hash[0] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[0]), a))
    hash[1] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[1]), b))
    hash[2] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[2]), c))
    hash[3] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[3]), d))
    hash[4] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[4]), e))
    hash[5] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[5]), f))
    hash[6] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[6]), g))
    hash[7] = binary2HexOfLength8(additionModulo232(hexTo32BitBinary(hash[7]), h))
  })

  return hash.join('')
}

const message = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
const messageInBinary = text2BinaryArray(message)
// message length in binary of 64 bits
const messageLengthInBinary = calculateMessageLengthValueInBinary(messageInBinary)
const input = initInput(messageInBinary)
const finalHash = generateHash(input)

console.log(finalHash)
//256
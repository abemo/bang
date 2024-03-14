import assert from 'assert'

const getNum = () => Math.ceil(Math.random() * 99) * (Math.round(Math.random()) ? 1 : -1)

const gcd = (a, b) => {
  [a, b] = [Math.abs(a), Math.abs(b)]

  if (a === 0 || b === 0) return Math.max(a, b)

  let remainder = 0
  while (remainder >= 0) {
    remainder = a % b
    if (remainder === 0) return b

    a = b
    b = remainder
  }
}

const areRelativelyPrime = (a, b) => {
  if (a === 0) return b === 1 || b === -1
  if (b === 0) return b === 1 || a === -1

  const commonDenom = gcd(a, b)
  return commonDenom === 1 || commonDenom === -1
}

const basicAreRelativelyPrime = (a, b) => {
  [a, b] = [Math.abs(a), Math.abs(b)]

  if (a === 1 || b === 1) return true
  if (a === 0 || b === 0) return false

  for (let i = 2; i <= Math.min(a, b); i++) {
    if (a % i === 0 && b % i === 0) return false
  }

  return true
}

for (let i = 0; i < 10000; i++) {
  assert(areRelativelyPrime(getNum(), 1))
  assert(areRelativelyPrime(getNum(), -1))

  const num = getNum()
  if (num !== 1 && num !== -1) {
    assert(!areRelativelyPrime(num, 0))
  }

  const otherNum = getNum()
  assert(
    areRelativelyPrime(num, otherNum) === 
    basicAreRelativelyPrime(num, otherNum)
  )
}

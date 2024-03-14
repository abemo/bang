7.1)

```cs
// Use Euclid's algorithm to calculate the GCD. See:
// en.wikipedia.org/wiki/Euclidean_algorithm
private long GCD(long a, long b)
{
  a = Math.abs(a);
  b = Math.abs(b);

  for(; ; )
  {
    long remainder = a % b;
    if (remainder == 0) return b;
    a = b;
    b = remainder;
  };
}
```

7.2) Writing comments as you code, and writing all the code without comments, then going back to insert comments afterwards.

7.4)

```cs
// Use Euclid's algorithm to calculate the GCD. See:
// en.wikipedia.org/wiki/Euclidean_algorithm
private long GCD(long a, long b)
{
  Debug.Assert(a > 0);
  Debug.Assert(b > 0);

  long aIn = a;
  long bIn = b;

  for(; ; )
  {
    long remainder = a % b;
    if (remainder == 0)
    {
      Debug.Assert(aIn % b == 0);
      Debug.Assert(bIn % b == 0);
    return b;
    }
    a = b;
    b = remainder;
  };
}
```

7.5) No, because error handling inside the GCD function would mean the calling function wouldn't know if the GCD was incorrectly calculated.

7.7)

- Open the car door.
- Get in the driver's seat of the car.
- Start the car.
- Drive forward while turning left.
- Turn left.
- Open the parking garage door.
- Turn right out of the parking garage.
- Drive to the stoplight.
- Turn left.
- Drive past the next stoplight.
- Drive to the next parking lot entrance on the right.
- Turn right into the parking lot.
- Find an empty parking space.
- Park the car in the parking space.

This makes the assumption that you know how to start and drive a car safely. It also assumes that you either understand how stoplights work, or that the lights are green when you get to them. It also assumes that there is an empty parking space in the parking lot.

8.1) (in JS)

```js
const basicAreRelativelyPrime = (a, b) => {
  [a, b] = [Math.abs(a), Math.abs(b)]

  if (a === 1 || b === 1) return true
  if (a === 0 || b === 0) return false

  for (let i = 2; i <= Math.min(a, b); i++) {
    if (a % i === 0 && b % i === 0) return false
  }

  return true
}
```

Assuming there is a function getNum that will return a random value between -1 million and 1 million, the testing code is as follows:

```js
for (let i = 0; i < 10000; i++) {
  assert(AreRelativelyPrime(getNum(), 1))
  assert(AreRelativelyPrime(getNum(), -1))

  const num = getNum()
  if (num !== 1 && num !== -1) {
    assert(!AreRelativelyPrime(num, 0))
  }

  const otherNum = getNum()
  assert(
    AreRelativelyPrime(num, otherNum) === 
    basicAreRelativelyPrime(num, otherNum)
  )
}
```

8.3) It's a black-box method because the AreRelativelyPrime method's implementation isn't given anywhere. You could test using a white-box or gray-box method if we knew how the AreRelativelyPrime method worked. The exhaustive testing method is theoretically possible, but the combinatorics for the range [-1 million, 1 million] might make the program take too long to run. If the range were smaller, the exhaustive testing method would be possible.

8.5) There were no errors in my initial code. See the [code](./areRelativelyPrime.js) for this problem.

8.9) Exhaustive testing falls into the black-box category because they don't need to have information about how the method they're testing works.

8.11) 

- L(Alice, Bob) = 5 * 4 / 2 = 10
- L(Bob, Carmen) = 4 * 5 / 1 = 20
- L(Alice, Carmen) = 5 * 5 / 2 = 12.5
- average Lincoln index = (10 + 20 + 12.5) / 3 = 14.17 bugs, so you could estimate around 15 bugs.

8.12) If testers have no bugs in common, then the denominator of the Lincoln index formula would be 0. This would imply that there are an infinite number of bugs, and probably means that the testers haven't tested thoroughly enough yet. Acting as if the testers found 1 bug in common would give you an estimate of the "lower bound" for the number of bugs.

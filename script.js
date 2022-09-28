'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;


  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">₹${mov}</div>
  </div>`

  containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}

// to check whhether current account has sufficient money to make transfer we need to check its balance, but it wasnt stored anywhere
// so we store it as object's property to check easily if current account has enough money
const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce(function (acc, cur, i, movements) {
    return acc + cur;
  })
  acc.balance = balance;
  labelBalance.textContent = `₹${balance}`
}


const calcDisplaySummary = function (account) {
  const deposits = account.movements.filter(function (mov) {
    return mov > 0;
  });

  const income = deposits.reduce(function (acc, deposit) {
    return acc + deposit
  }, 0);
  labelSumIn.textContent = `₹${income}`;

  const out = account.movements.filter(function (mov) {
    return mov < 0;
  }).reduce(function (acc, mov) {
    return acc + mov;
  }, 0);
  labelSumOut.textContent = `₹${Math.abs(out)}`;

  const interest = account.movements.filter(mov => mov > 0).map(mov => (mov * account.interestRate)/100).filter((interest, i, arr) => {
    console.log(arr);
    return interest >= 1;
  }).reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `₹${interest}`
  
}

// CREATES USERNAMES LIKE => stw using initials of name
const user = 'Steven Thomas Williams';
const createusernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner.toLowerCase().split(' ').map(function (name) {
      return name[0];
    }).join('');
  })
}


createusernames(accounts);
console.log(accounts);

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
}

let currentAccount;
// Event handler LOGIN function =>
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  console.log(currentAccount);

  // below ?. is also known as optional chaining
  if (currentAccount?.pin === Number(inputLoginPin.value)) {// ? is used to check if user exists or not 
    // display UI and Message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // update UI
    updateUI(currentAccount);
  }
})

// MONEY TRANSFER METHOD =>
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferTo = inputTransferTo.value;// stores name in which money would be tranfered
  // console.log(transferTo);
  const transferAmt = Number(inputTransferAmount.value);
  // console.log(transferAmt);

  const amtTransferAccount = accounts.find(acc => transferTo === acc.username);// loops through every value in accounts array and check whose username matches to the initials entered in form
  console.log(amtTransferAccount, transferAmt);
  
  // check if amtTransferAccount exists, currentAccount needs to be greater than amt of transfer to be made, shouldnt make tranfer to my account
  if (amtTransferAccount && currentAccount.balance >= transferAmt && transferAmt > 0 && 
    amtTransferAccount.username !== currentAccount.username) {
      currentAccount.movements.push(-transferAmt);
      amtTransferAccount.movements.push(transferAmt);

      // update UI
    updateUI(currentAccount);
  }

  // clean entered values
  inputTransferTo.value = "";
  inputTransferAmount.value = "";
})

// LOAN METHOD
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);// convert STRING to NUMBER
  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    currentAccount.movements.push(amount);

    // UPDATE UI
    updateUI(currentAccount);
  }

  inputLoanAmount.value = "";
})
// CLOSE CURRENT USER ACCOUNT => DELETING OBJECT FROM ACCOUNTS ARRAY
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  
  if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    // FIND INDEX AT WHICH THE ELEMENT TO BE DELETED IS STORED => WORKS SAME AS FIND() METHOD CONCEPT
    // INDEXOF() ONLY WORKS IF THAT VALUE IS PRESENT IN THE ARRAY AND WE CANT USE EXPRESSIONS IN IT
    // BUT with FINDINDEX() WE CAN USE EXPRESSIONS INSIDE THE CALLBACK FUNCN OF FINDINDEX()
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    
    // DELETE ACCOUNT
    accounts.splice(index, 1);
    
    // HIDE UI
    containerApp.style.opacity = 0;

    inputCloseUsername.value = inputClosePin.value = "";
    labelWelcome.textContent = `Log in to get started`;
  }
})

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});


/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES



const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];




/////////////////////////////////////////////////
// for of method
// for (const movement of movements) {
//     if (movement > 0) {
//         console.log(`You deposited ${movement} amount in your account`);
//     } else {
//         console.log(`You withdrew ${Math.abs(movement)} amount from your account`);
//     }
// }
// console.log("-----FOROF WITH INDICES------");
// for (const [i, movement] of movements.entries()) {
//     if (movement > 0) {
//         console.log(`Movement ${i + 1} You deposited ${movement} amount in your account`);
//     } else {
//         console.log(`Movement ${i + 1} You withdrew ${Math.abs(movement)} amount from your account`);
//     }
// }



// for each is a higher order function that accepts call back method as argument
console.log("----------------------FOREACH---------------------");
// WE CAN NOT USE CONTINUE AND BREAK STATEMENT WITH FOREACH METHOD
// movements.forEach(function (movement) {
    // if (movement > 0) {
    //     console.log(`You deposited ${movement} amount in your account`);
    // } else {
    //     console.log(`You withdrew ${Math.abs(movement)} amount from your account`);
    // }
// })

// console.log("-----FOREACH WITH INDICES------");
// movements.forEach(function (movement, index, array) {// order should be exactly like this
//     if (movement > 0) {
//         console.log(`Movement ${index + 1} You deposited ${movement} amount in your account`);
//     } else {
//         console.log(`Movement ${index + 1} You withdrew ${Math.abs(movement)} amount from your account`);
//     }
// })


// const currencies = new Map([
//     ['USD', 'United States dollar'],
//     ['EUR', 'Euro'],
//     ['GBP', 'Pound sterling'],
//   ]);

// currencies.forEach(function (value, key, map) {
//     console.log(`${key}: ${value}`);
// })

// const currenciesUnique = new Set(['USD', 'EUR', 'GBP', 'EUR']);
// currenciesUnique.forEach(function (val, key, set) {// sets dont have indexes
//     console.log(`${key}: ${val}`);
// })

// MAP METHOD =>
// const euroToUSD = 1.1;

// const movementsUSD = movements.map(function (mov) {
//   return mov * euroToUSD;
// })
// console.log(movements);// original array
// console.log(movementsUSD);// new array from map function with applied oprn in callback funcn

// const movementDescriptions = movements.map(function (movement, i, arr) {
//   if (movement > 0) {
//         return `Movement ${i + 1}: You deposited ${movement} amount in your account`;
//     } else {
//         return `Movement ${i + 1}: You withdrew ${Math.abs(movement)} amount from your account`;
//     }
// })

// console.log(movementDescriptions);

// filter method =>
// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// })
// console.log(deposits);

// const withdrawals = movements.filter(function (mov) {
//   return mov < 0;
// })
// console.log(withdrawals);

// accumulator necessary in reduce function
// const balance = movements.reduce(function (acc, cur, i, arr) {// similar to finding sum of all array elements
//   return acc + cur;
// }, 0);// requires to pass initial value of acc 

// console.log(balance);

//FIND METHOD => returns first value from array that matches the specified condition
const firstWithdrawal = movements.find(mov => mov < 0);
console.log(firstWithdrawal);

const account = accounts.find(acc => acc.owner === "Jessica Davis");
console.log(account);

// INCLUDES METHOD IS FOR EQUALITY
console.log(movements.includes(-130));

// SOME CHECKS IF THERE IS ANY VALUE IN ARRAY THAT MATCHES OUR CONDITION
const anyDeposits = movements.some(mov => mov > 1500);
console.log(anyDeposits);
// ABOVE SOME METHOD WOULD BE USEFUL FOR TAKING LOAN AS WHILE LOAN WE HAVE A CONDITION THAT 
//IF WE HAVE ANY MOVEMENT GREATER THAN 10% OF ENTERED LOAN AMOUNT BY USER

//EVERY
console.log(movements.every(mov => mov > 0));

//FLAT method to flatten array consisting of nested arrays. argument can contain how many deeper level os nested 
//array we want to flatten
const arr1 = [[1,2,3], [4,5,6], 7, 8];
console.log(arr1.flat());

const arr2 = [[[1,2], 3], [4, [5,6]], 7, 8];
// below method will give:
// 0
// : 
// (2) [1, 2]
// 1
// : 
// 3
// 2
// : 
// 4
// 3
// : 
// (2) [5, 6]
// 4
// : 
// 7
// 5
// : 
// 8
// length
// : 
// 6
console.log(arr2.flat());
console.log(arr2.flat(2));//[1, 2, 3, 4, 5, 6, 7, 8]

const overallBalance = accounts.map(acc => acc.movements).flat().reduce((acc, mov) => acc + mov);
console.log(overallBalance);

//FLATMAP was introduced for above map and flat method, but here flat will only work for 1 level deep flattening
// for more levels flattening use original FLAT
const totalBalance = accounts.flatMap(acc => acc.movements).reduce((acc, mov) => acc + mov);// same result as above
console.log(totalBalance);


// Sorting Arrays
// Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort());
console.log(owners);
// Numbers
console.log(movements);
// return < 0, A, B (keep order)
// return > 0, B, A (switch order)
// Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
movements.sort((a, b) => a - b);
console.log(movements);
// Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
console.log(movements);







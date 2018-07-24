// ! BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else this.percentage = -1;
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      expense: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // create new ID
      console.log(data);
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else ID = 0;

      // create new item based on 'income' or 'expense' type
      if (type === "expense") {
        newItem = new Expense(ID, des, val);
      } else if ((type = "income")) {
        newItem = new Income(ID, des, val);
      }

      //Push it into our data structure
      data.allItems[type].push(newItem);

      //return new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      //id = 6

      //ids = [1 2 4 6 8]
      // index =3

      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      console.log(ids, id);

      index = ids.indexOf(id);

      console.log(index);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
      console.log(data);
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("expense");
      calculateTotal("income");

      // calculate the budget : income - expenses
      data.budget = data.totals.income - data.totals.expense;

      //calculate percentage of income spent
      if (data.totals.income > 0) {
        data.percentage = Math.round(
          (data.totals.expense / data.totals.income) * 100
        );
        // * Expense = 100 and income 300, spent 33.3333% = 100/300 =0.3333 * 1000
      } else data.percentage = -1;
    },

    calculatePercentages: function() {
      console.log("income", data.totals.income);
      data.allItems.expense.forEach(function(current) {
        current.calcPercentage(data.totals.income);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.expense.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.income,
        totalExp: data.totals.expense,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

// ! UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel:".budget__title--month"
  };


  var formatNumber = function(num,type) {
    var numSplit,int,dec,sign;
    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands

    2310.45 - > + 2,310.46
    2000 -> + 2,000.00
    */
   num = Math.abs(num);
   num = num.toFixed(2);

 var  formatter =  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

//    numSplit = num.split('.')

//    int = numSplit[0];
//    if(int.length > 3){
//        int = int.substring(0,int.length-3) + ',' + int.substring(int.length-3,int.length); // 2310  = 2,310
//    } 
// console.log(int.length);
//    dec = numSplit[1];

//    type === "expense" ? sign = '-' : sign = '+';



   return  (type === "expense" ?  '-' : '+') + formatter.format(num) ;
};

var nodeListForeach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // income or expense
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    getDOMStrings: function() {
      return DOMstrings;
    },
    addListItem: function(obj, type) {
      var html, newHtml, element, fields, fieldsArray;

      console.log("type", type);
      // Create html string with palceholder text

      if (type === "income") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "expense") {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace the placeholder texte with some actualdata
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%",formatNumber(obj.value,type));

      // Insert the HTML
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    clearFields: function() {
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(field, index, array) {
        field.value = "";
      });

      fieldsArray[0].focus();
    },
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },
    displayBudget: function(obj) {

        obj.budget > 0 ? type="income" : type = "expense";
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"income");
      document.querySelector(DOMstrings.expensesLabel).textContent =
        formatNumber(obj.totalExp,"expense");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      

      nodeListForeach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function(){
        var now,year,month;
         now = new Date();
       // var christmas = new Date(2016,11,25);
       year = now.getFullYear();
       months =["January","February","March","April","May","June","July","August","September","October","November","December"];
       month =now.getMonth();
       console.log(year)
       document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+ year;
    },
    changedType:function(){
        var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ','+
            DOMstrings.inputValue
        );

        nodeListForeach(fields, function(cur){
            cur.classList.toggle('red-focus');

        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    }


   
  };
})();

// ! CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
  };

  var updateBudget = function() {
    // 1 Calculate the budget
    budgetCtrl.calculateBudget();
    // 2 Return the budget
    var budget = budgetCtrl.getBudget();
    // 3 Display the budget on UI
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1 get the field input data
    input = UIController.getInput();

    // test if inputs are valid
    if (input.description != "" && !isNaN(input.value) && input.value > 0) {
      // 2 Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3 Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4 clear the fields
      UICtrl.clearFields();

      //5 Calculate and update budget
      updateBudget();

      //6 calculate and update percentages
      updatePercentages();
    }
  };

  var updatePercentages = function() {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);

    if (itemID) {
      // income-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. dlte item from data structure
      budgetCtrl.deleteItem(type, ID);
      //2. delete the item from ui
      UICtrl.deleteListItem(itemID);
      //3 update and show the new budget
      updateBudget();
      //4 calculate and update percentages
      updatePercentages();
    }
  };
  return {
    init: function() {
      console.log("app started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
      UICtrl.displayMonth();
    }
  };
})(budgetController, UIController);

controller.init();

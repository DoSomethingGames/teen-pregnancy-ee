$(document).ready(function() {
	var choice1Text = [
    'The number of American teen pregnancies each year'
    ];
  var choice2Text = [
    {msg: 'Number of active US Army personnel', ans: 2},
    {msg: 'Total stars visible from earth', ans: 2},
    {msg: 'General surgeons in the US', ans: 2},
    {msg: 'Total teen girls in US', ans: 1}
    ];

  var answerKey = [1, 1, 1, 2];
  var questionProgress = 0;

  document.getElementById('choice1').innerHTML = choice1Text[0];
  document.getElementById('choice2').innerHTML = choice2Text[questionProgress].msg;
  //$('choice1').html(choice1Text[0]);

  $("#choice1").click(function() {
    if (choice2Text[questionProgress].ans === 2) {
      $("#choice1").css({
        'background-color': 'red'
      });

      $("#choice2").css({
        'background-color': 'green'
      });
    }

    questionProgress++;

  });

  $("#choice2").click(function() {
    if (choice2Text[questionProgress].ans === 2) {
      $("#choice2").css({
        'background-color': 'green'
      });
    }

    questionProgress++;

  });

});

// okay, what do we want to do?
// i want to check if what was clicked was the correct answer
// inputs: what was clicked / index
// check against what was clicked against choice2Text[index].ans
// if ===, turn green and increase index
// if !, turn red, turn other green, and increase index

// iterate this throughout the choice2Text array

// $('#choice1').click

var checkIfCorrect = function()

angular.module('clarity', ['ionic'])
/**
 * The Courses factory handles saving and loading courses
 * from local storage, and also lets us save and load the
 * last active course index.
 */
.factory('Courses', function() {
  return {
    all: function() {
      var courseString = window.localStorage['courses'];
      if(courseString) {
        return angular.fromJson(courseString);
      }
      return [];
    },
    save: function(courses) {
      window.localStorage['courses'] = angular.toJson(courses);
    },
    newCourse: function(courseTitle) {
      // Add a new course
      return {
        title: courseTitle,
        questions: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveCourse']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveCourse'] = index;
    }
  }
})

.controller('ClarityCtrl', function($scope, $timeout, $ionicModal, Courses, $ionicSideMenuDelegate) {

  // A utility function for creating a new course
  // with the given courseTitle
  var createCourse = function(courseTitle) {
    var newCourse = Courses.newCourse(courseTitle);
    $scope.courses.push(newCourse);
    Courses.save($scope.courses);
    $scope.selectCourse(newCourse, $scope.courses.length-1);
  }


  // Load or initialize courses
  $scope.courses = Courses.all();

  // Grab the last active, or the first course
  $scope.activeCourse = $scope.courses[Courses.getLastActiveIndex()];

  // Called to create a new course
  $scope.newCourse = function() {
    var courseTitle = prompt('Course name');
    if(courseTitle) {
      createCourse(courseTitle);
    }
  };

  // Called to select the given course
  $scope.selectCourse = function(course, index) {
    $scope.activeCourse = course;
    Courses.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-question.html', function(modal) {
    $scope.questionModal = modal;
  }, {
    scope: $scope
  });

  $scope.createQuestion = function(question) {
    if(!$scope.activeCourse || !question) {
      return;
    }
    $scope.activeCourse.questions.push({
      title: question.title
    });
    $scope.questionModal.hide();

    // Inefficient, but save all the courses
    Courses.save($scope.courses);

    question.title = "";
  };

  $scope.newQuestion = function() {
    $scope.questionModal.show();
  };

  $scope.closeNewQuestion = function() {
    $scope.questionModal.hide();
  }

  $scope.toggleCourses = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };


  // Try to create the first course, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.courses.length == 0) {
      while(true) {
        var courseTitle = prompt('Your first course title:');
        if(courseTitle) {
          createCourse(courseTitle);
          break;
        }
      }
    }
  });

});
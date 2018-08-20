function GoalsIndexCtrl($scope, $http, $rootScope) {
  const userGoals = [];
  $http({
    method: 'GET',
    url: '/api/goals'
  })
    .then(res => {

      res.data.forEach(goal => {
        if(goal.createdBy._id === $rootScope.user._id) userGoals.push(goal);
      });
      console.log('User goal is ===>', userGoals);
      $scope.goals = userGoals;
    });

}


export default GoalsIndexCtrl;

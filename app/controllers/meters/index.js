import Controller from '@ember/controller';

export default Controller.extend({
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  currentDay: new Date().getDate(),
  currentHour: new Date().getHours()
});

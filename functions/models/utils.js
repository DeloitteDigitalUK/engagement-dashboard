module.exports = {
  
  // convert firestore timestamps to dates
  transformDate: function(value, originalValue) {
    return !this.isType(value) && originalValue && originalValue.toDate? originalValue.toDate() : value;
  }

};
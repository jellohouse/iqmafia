var secrets = require('../config/secrets.js');
var Airtable = require('airtable');
var moment = require('moment');
var base = new Airtable({apiKey: secrets.airtableApiKey}).base('appvCtvOIbS4lK9eB');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  var rows = [];
  base('Job Postings').select({
      // Selecting the first 3 records in Grid view:
      //maxRecords: 3,
      view: "Grid view",
      sort: [{field: "Created Time", direction: "desc"}],
  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
      records.forEach(function(record) {
        record.fields['Created Time'] = moment(record.fields['Created Time']).format("MMMM Do YYYY");
        record.fields.ID = record.getId();
        rows.push(record.fields);
      });
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
  }, function done(err) {
      if (err) { console.error(err); return; }
      console.log("OYYY", rows);
      res.render('postings', {
        title: 'Job Postings',
        postings: rows,
      });
  });
};

/**
 * POST /newsletter
 * Home page.
 */
exports.newsletter = (req, res) => {
  var sEmail = req.body.email;
}


/**
 * GET /postJob
 * Home page.
 */
exports.postJob = (req, res) => {
  res.render('postJob', {
    title: 'Post a Job'
  });
};

/**
 * GET /signUp
 * Home page.
 */
exports.signUp = (req, res) => {
  res.render('signUp', {
    title: 'Sign up as a programmer'
  });
};


/**
 * GET /apply
 * Home page.
 */
exports.apply = (req, res) => {
  //res.send("tagId is set to " + req.params.jobId);
  res.render('apply', {
    title: 'Apply',
    jobId: req.params.jobId,
  });
};


/**
 * POST /apply
 * Home page.
 */
exports.applyPost = (req, res) => {
  //1) Check if provided student email is in table (if not force to create)
  //2) Make a new row in 'Applications' giving it student and job posting
  //console.log(req.body);
  var sEmail = req.body.email;
  var jobRecID = req.params.jobId;
  var studentRecID = '';

  console.log("Got job ID: ", jobRecID);

  base('Students').select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 1,
      view: "Grid view",
      filterByFormula: "({Email} = '"+sEmail+"')",

  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
      records.forEach(function(record) {
        console.log('Retrieved', record.get('Name'));
        studentRecID = record.getId();
      });
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
  }, function done(err) {
    if (err) { console.error(err); return; }
    if (studentRecID) {
      base('Applications').create({
        "Name":
          "Applicant",
        "Student": [
          studentRecID
        ],
        "Job": [
          jobRecID
        ],
        "Status":
          "new"
      }, function(err, record) {
        if (err) {
          console.error(err);
          return;
        }
        res.render('success', {
          title: 'You have successfully applied!!'
        });
      });
    } else {
      res.render('signup', {
        title: 'Signup as a programmer'
      });
    }

  });
};


/**
 * GET /success
 * Home page.
 */
exports.success = (req, res) => {
  res.render('success', {
    title: 'You have successfully applied!!'
  });
};

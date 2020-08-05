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
      filterByFormula: "({status} = 'open')",
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
      //console.log("OYYY", rows);
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
  var studentRecID = '';
  base('Students').select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 1,
      view: "Grid view",
      filterByFormula: "({Email} = '"+sEmail+"')",
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        console.log('Retrieved', record.get('Name'));
        studentRecID = record.getId();
      });
      fetchNextPage();
  }, function done(err) {
    if (err) { console.error(err); return; }
    if (studentRecID) {
      res.render('success', {
        title: 'You have already applied',
        message: 'You have already applied to the newsletter.'
      });
    } else {
      let extension = sEmail.split("@").pop();
      if (extension == 'uwaterloo.ca' || extension == 'edu.uwaterloo.ca') {
        base('Students').create({
          "Name": "Applicant",
          "School": "University of Waterloo",
          "Email": sEmail,
        }, function(err, record) {
          if (err) {
            console.error(err);
            return;
          }
          res.render('success', {
            title: 'You have successfully subscribed to the newsletter!!',
            message: 'You have successfully subscribed to the newsletter!! An email will be sent to you with the opportunity to apply every time there is a new job posting.'
          });
        });
      } else {
        res.render('success', {
          title: 'You have successfully subscribed to the newsletter!!',
          message: 'You must use your valid @uwaterloo.ca email address to signup.'
        });
      }
    }
  });
};


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
 * GET /apply
 * Home page.
 */
exports.apply = (req, res) => {
  //res.send("tagId is set to " + req.params.jobId);
  base('Job Postings').find(req.params.jobId, function(err, record) {
    if (err) { console.error(err); return; }
    res.render('apply', {
      title: 'Apply',
      jobId: req.params.jobId,
      posting: record.fields,
    });
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
  var sName = req.body.name;
  var sExperience = req.body.experience;
  var jobRecID = req.params.jobId;
  var studentRecID = '';

  console.log("Got job ID: ", jobRecID);

  let createApplication = function(student) {
    base('Applications').create({
      "Name": sEmail,
      "Experience": sExperience,
      "Student": [
        student
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
        message: 'You have successfully applied to this job offer!!'
      });
    });
  }

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

      createApplication(studentRecID);

    } else {
      let extension = sEmail.split("@").pop();
      if (extension == 'uwaterloo.ca' || extension == 'edu.uwaterloo.ca') {
        base('Students').create({
          "Name": sName,
          "School": "University of Waterloo",
          "Email": sEmail,
        }, function(err, record) {
          if (err) {
            console.error(err);
            return;
          }
          createApplication(record.getId());
        });
      } else {
        res.render('success', {
          title: 'Error',
          message: 'You must use your valid @uwaterloo.ca email address to apply.'
        });
      }
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

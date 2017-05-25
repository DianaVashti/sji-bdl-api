const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const dummyReports = require('./dummy_data');

const Report = mongoose.model('report');

describe('Reports controller', () => {
  // User created report
  it('POST to /api/reports creates a new report', (done) => {
    Report.count().then(count => {
      request(app)
        .post('/api/reports')
        .send(dummyReports.reportOne)
        .end(() => {
          Report.count().then(newCount => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  // Admin reads new unedited reports
  it('GET to /api/reports/new returns all the unedited reports', (done) => {
    const unEditedReport = new Report(dummyReports.reportOne);
    const editedReport = new Report(dummyReports.reportTwo);

    Promise.all([unEditedReport.save(), editedReport.save()])
      .then(() => {
        request(app)
          .get('/api/reports/new')
          .end((err, res) => {
            assert(res.body[0]._id.toString() === unEditedReport._id.toString());
            assert(res.body[0].edited === false);
            done();
          });
      });
  });

  it('POST to /api/reports/:id creates an edited subdocument', (done) => {
    const unEditedReport = new Report(dummyReports.reportOne);
    const edits = dummyReports.editedReportOne;

    unEditedReport.save().then(() => {
      request(app)
        .post(`/api/reports/${unEditedReport._id}`)
        .send(edits)
        .end(() => {
          Report.findById({ _id: unEditedReport._id })
            .then((report) => {
              assert(report.editedReport.title === 'Leave feathers behind');
              assert(report.edited === true);
              done();
            });
        });
    });
  })
});

import * as https from 'https';
import * as Course from '../models/courses';
import * as admin from 'firebase-admin';

const serviceAccount = require('./striped-reserve-853-firebase-adminsdk-rsa37-eba2a0f172.json');

const migrate = (req, res) => {
  console.log('migrate');
  console.log(serviceAccount);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();

  let courses = [];
  let i = 1;
  const promise = Course.find({}).exec();
  // const collections = db.collection('courses');
  // console.log(collections);
  promise.then(
    (rcourses) => {
      const batch = db.batch();
      courses = rcourses;
      // const collection = db.collection('courses');
      for (const course of rcourses) {
        console.log(course['_id']);
        // const ref = db.collection('courses').doc();
        // i++;
        // ref.set({
        //   id: i,
        //   title: course['title'],
        //   code_name: course['code_name'],
        //   desc: course['desc'],
        //   keywords: course['keywords'],
        //   youtube_ref: course['youtube_ref'],
        //   category: course['category']
        // });
        // const collection = db.collection('courses');
      }
      res.json(courses);
    }).catch(error => {
  });
};

export = migrate;

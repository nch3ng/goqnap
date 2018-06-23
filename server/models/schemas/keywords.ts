import * as mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema({
  text: String,
  times: Number
});


const KeywordDB = mongoose.model('Keyword', keywordSchema);

export default KeywordDB;

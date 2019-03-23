import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
  },
  guid: {
    type: String,
  },
  author: {
    type: String,
    enum: ['senate', 'assembly', 'constitutionalCouncil', 'other'],
    default: 'other',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  pubDate: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    enum: ['proposal', 'project', 'constitutional', 'organic', 'program', 'resolution', 'other'],
    default: 'other',
    required: true,
  },
});

export default mongoose.model('Item', ItemSchema);

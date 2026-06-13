const mongoose = require('mongoose')

const episodeSchema = new mongoose.Schema({
  num:       { type: Number, required: true },
  title:     { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration:  { type: String, default: '' },
  airDate:   { type: String, default: '' },
  subUrl:    { type: String, default: '' },
  sources:  { type: mongoose.Schema.Types.Mixed, default: null },
  visible:  { type: Boolean, default: true },
}, { _id: false })

const seasonSchema = new mongoose.Schema({
  slug:     { type: String, required: true },
  label:    { type: String, required: true },
  episodes: [episodeSchema],
}, { _id: false })

const seriesSchema = new mongoose.Schema({
  id:            { type: String, required: true, unique: true },
  title:         { type: String, required: true },
  titleFull:     { type: String, default: '' },
  titleJP:       { type: String, default: '' },
  poster:        { type: String, default: '' },
  banner:        { type: String, default: '' },
  gradient:      { type: String, default: '' },
  status:        { type: String, enum: ['ongoing', 'completed', 'upcoming', 'licensed', 'dropped'], default: 'ongoing' },
  licensedBy:    { type: String, default: '' },
  year:          { type: Number },
  studio:        { type: String, default: '' },
  score:         { type: Number, default: 0, min: 0, max: 10 },
  episodesAired: { type: Number, default: 0 },
  genres:        [{ type: String }],
  synopsis:      { type: String, default: '' },
  tags:          [{ type: String }],
  seasons:       [seasonSchema],
  episodes:      [episodeSchema],
  season:        { type: String, default: '' },
  duration:      { type: String, default: '' },
  tmdbId:        { type: Number,  default: null },
  isSimulcast:   { type: Boolean, default: false },
  visible:       { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Series', seriesSchema)

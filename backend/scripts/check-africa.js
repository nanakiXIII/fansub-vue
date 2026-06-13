const mongoose = require('mongoose')
const Series   = require('../src/models/Series')
const Release  = require('../src/models/Release')

const URI = 'mongodb://rouge:22111990@192.168.1.180:27017/chuushin?authSource=admin'

mongoose.connect(URI).then(async () => {
  const series = await Series.find({ title: { $regex: /africa/i } }).lean()
  console.log('Series trouvées:', JSON.stringify(series.map(s => ({ id: s.id, title: s.title })), null, 2))

  const releases = await Release.find({ serieId: { $regex: /africa/i } }).sort({ epNum: 1 }).lean()
  console.log('Releases:', JSON.stringify(releases.map(r => ({ serieId: r.serieId, ep: r.epNum, quality: r.quality })), null, 2))

  process.exit(0)
}).catch(e => { console.error(e.message); process.exit(1) })

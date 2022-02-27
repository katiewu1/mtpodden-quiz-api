import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import listEndpoints from 'express-list-endpoints'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/mtpoddenQuiz'
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.Promise = Promise

// Schema and Model for the DB
const FormSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
  },
  profession: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gdpr: {
    type: Boolean,
    required: true,
  },
  answers: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
})

const Form = mongoose.model('Form', FormSchema)

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Unreachable database -> status 503
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service unavailable' })
  }
})

// Start defining your routes here
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

// post - submit a form
app.post('/submit', async (req, res) => {
  try {
    const newSubmit = await new Form(req.body).save()

    res.status(201).json({ response: newSubmit, success: true })
  } catch (err) {
    res.status(400).json({ response: err, success: false })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

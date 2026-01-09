const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // express app
const port = 3000; // port the server will listen to

app.use(cors()); //cross-origin resourse sharing, helps the browser make requests from the backend
app.use(express.json()); //allows express to process JSON
app.use(express.static('public')); // frontend folder

mongoose.connect('mongodb://localhost:27017/tasks_db') //connects to local mongdb database (tasks_db)
  .then(() => { //if the connection is successful show a message
    console.log(' Connected to MongoDB');

    app.listen(port, () => { //start the express 
      console.log(` Server running at http://localhost:${port}`);
    });
  })
  .catch(err => { //if the connection fails, inform 
    console.error(' MongoDB connection error:', err.message);
  });

const taskSchema = new mongoose.Schema({ //schema is a blueprint for documents in mongoDB
  text: String, //stores text 
  date: String, //stores date
  time: String  //stores time
}, { timestamps: true });//for sorting tasks chronologically

const Task = mongoose.model('Task', taskSchema);// interacts with mongodb, acts as a bridge between this file and the database

app.get('/tasks', async (req, res) => { //when frontend calls this, it loads all existing tasks
  const tasks = await Task.find().sort({ createdAt: 1 }); //sorts the tasks by creation
  res.json(tasks); //sends the tasks back to the frontend
});

app.post('/tasks', async (req, res) => { //frontend calls this when the user adds a new task
  const { text, date, time } = req.body; //extract the task details from the frontend
  const task = new Task({ text, date, time }); //create a new task object
  await task.save(); //save the task in mongodb
  res.json({ id: task._id }); //returns the mongodb id of the new task to the frontend
});

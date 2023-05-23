
  import mongoose, { ConnectOptions } from 'mongoose';
  const ConnectDatabase = () => {

  // const DB = process.env.DB_URI_DEV 
  const DB =  process.env.DB_URI_DEV 

  mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions)
    .then((data) => {
        console.log("Mongodb connected with server : ",data.connection.host);
      })
  }
  export default ConnectDatabase
    
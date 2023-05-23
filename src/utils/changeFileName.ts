
    import path from "path";
    import { v4 as uuidv4 } from "uuid";
    const ChangeFileName = async (card:any) => {
    let res;

    try {
    if (card.mimetype == "image/png") {
      const newName = uuidv4();
      res = newName + ".png";
    } else if (card.mimetype == "image/jpeg") {
      const newName = uuidv4();
      res = newName + ".jpeg";
    } else if (card.mimetype == "image/jpg") {
      const newName = uuidv4();
      res = newName + ".jpg";
    }

    const folderLocation = "public/images/";
    const uploadLocaton = folderLocation.concat(res);
    card.mv(uploadLocaton, function (err) {
      if (err) {
        console.log(err)
      }
    });
    } catch (error) {
      console.log(error)
    }

    return res;
    };
    
    export { ChangeFileName }
    
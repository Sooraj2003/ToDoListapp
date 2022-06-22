const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js")


const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-sooraj:soorajbond2003@cluster0.qu5h6.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the To do list"
})
const item2 = new Item({
  name: "Hit + to add an item"
})

const item3 = new Item({
  name: "Hit <-- to delete an item"
})

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res) {
  let day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully updated");
          }
        })
        res.redirect("/");
      } else {
        res.render("list", {
          listHeading: day,
          newlistItems: foundItems
        });
      }
    }
  })
})
const listSchema = {
  name: String,
  list: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({
    name: customListName,
    list: defaultItems
  })

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        list.save(function(err) {
          if (!err) {
            res.redirect("/" + customListName)
          }
        });


      } else {
        res.render("list", {
          listHeading: foundList.name,
          newlistItems: foundList.list

        })

      }
    }
  })

})
app.get("/about", function(req, res) {
  res.render("about");
})

app.post("/", function(req, res) {

  const item = req.body.newItem;
  const list = req.body.list;
  let day = date.getDate();
  const itemName = new Item({
    name: item
  })
  if (list === day) {
    itemName.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: list
    }, function(err, foundList) {
      foundList.list.push(itemName);
      foundList.save(function(err) {
        if (!err) {
          res.redirect("/" + list);
        }
      });

    })
  }


})

app.post("/delete", function(req, res) {
  const itemToBeDeleted = req.body.checkbox;
  const listName = req.body.listName;
  let day = date.getDate();
  if (listName === day) {
    Item.findByIdAndRemove(itemToBeDeleted, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Sucessfully Deleted the checked item");
      }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        list: {
          _id: itemToBeDeleted
        }
      }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      })
    }
  })




app.listen(3000, function() {
  console.log("Listening at port 3000!");
})

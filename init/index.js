const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

main()
 .then(() =>{
    console.log("Connections SuccessFull!..")
 })
 .catch((err) =>{
    console.log(err);
 })
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderLust');

}

const initDB =  async() =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({ ...obj, owner: "66d153a0eedf6c07c1e8b168"}));
    await Listing.insertMany(initData.data);
    console.log("data was initilized");
}
initDB();

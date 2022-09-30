import mongoose from 'mongoose'

var OrderSchema = new mongoose.Schema({
  posting_number: { type: String, unique: true },
  date: { type: String, required: false },
  products: { type: Array, required: false },
  owner: { type: String, required: false }
}, { collection: "orders", required: false });

var UserSchema = new mongoose.Schema({
  user_id: { type: String, unique: true,required: false },
  username: { type: String, required: false },
  first_name: { type: String, required: false },
  last_name: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  orders: { type: Array, required: false },
  verify_code: { type: Number, required: false },
  verified: { type: Boolean, required: false },
  header: { type: Object, required: false },
  subscribed: { type: Boolean, default: true },
  codes: { type: Array, required: false },
  last_code: { type: String, required: true }
}, { collection: "users" });

let orders = mongoose.model("orders", OrderSchema);
let users = mongoose.model("users", UserSchema);

export default { orders, users };
// module.exports = users;
// // admin.js
// admin = db.getSiblingDB("admin")

// let's authenticate to create the other user
admin = db.getSiblingDB("admin")
admin.createUser(
  {
    user: "userAdmin",
    pwd: "userAdminPassword2019",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)
db.getSiblingDB("admin").auth("userAdmin", "userAdminPassword2019" )
// creation of the replica set admin user
db.getSiblingDB("admin").createUser(
  {
    "user" : "replicaAdmin",
    "pwd" : "replicaAdminPassword2017",
    roles: [ { "role" : "clusterAdmin", "db" : "admin" } ]
  }
)

db.getSiblingDB("admin").createUser(
  {
    user: "root",
    pwd: "example",
    roles: [ { role: "root", db: "admin" } ]
  }
)
// db.getSiblingDB("admin").auth("root", "example" )

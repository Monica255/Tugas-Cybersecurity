const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (username, password, done) => {
    console.log(username, password);
    pool.query(
      `SELECT * FROM accounts WHERE username = $1`,
      [username],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];

          if(password===user.password){
            return done(null, user);
          }else{
            return done(null, false, { message: "Password is incorrect" });
          }
          //bcrypt.compare(password, user.password, (err, isMatch) => {
            //if (err) {
              //console.log(err);
            //}
            //if (isMatch) {
              //return done(null, user);
            //} else {
              //password is incorrect
              //return done(null, false, { message: "Password is incorrect" });
            //}
          //});
        } else {
          // No user
          return done(null, false, {
            message: "No user with that username"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM accounts WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
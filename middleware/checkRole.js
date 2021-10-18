module.exports = authenticateRole = (rolesArray) => (req, res, next) => {
  if(!req.user) {
    return res.status(401).json({ msg: 'Brak autoryzacji' });
  }
  let authorized = false;
  rolesArray.forEach(role => {

   authorized = req.user.role === role;
  })
  if(authorized) {
    return next();
  }
  return res.status(401).json({ msg: 'Brak uprawnień' })
}

export function authenticate(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: 'Not authenticated' });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.session.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

export function requireLoginPage(req, res, next) {
  console.log('requireLoginPage session.user:', req.session.user);
  if (!req.session.user) {
    console.log('→ redirecting to /login');
    return res.redirect('/login');
  }
  console.log('→ user logged in, continuing');
  next();
}

const authorize = (...permissions) => {
  return (req, res, next) => {
    let accessibles = consolidateAllPermission(req.currentEmployee.roles); // ['a','b','c']
    // permissions = ['a','x']
    let canAccess = accessibles.some((accessible) => {
      return ~permissions.indexOf(accessible);
    });

    if (canAccess) {
      return next();
    } else {
      return res.status(200).send({
        error: 'Unauthorised Access',
      });
    }
  };
};

const valid = (roles) => {
  let accessibles = consolidateAllPermission(roles); // ['a','b','c']
  // permissions = ['a','x']
  return accessibles.some((accessible) => {
    return ~permissions.indexOf(accessible);
  });
};

const consolidateAllPermission = (roles = []) => {
  return roles.reduce((acc, role) => {
    let perm = (role.permissions || []).reduce((perms, perm) => {
      perms = [...perms, perm.name];
      return perms;
    }, []);

    acc = [...acc, ...perm];
    return acc;
  }, []);
};

// e.g. $permission || $permission2, ($permission1 || $permission2 ) && permission3
const expression = (expr) => (req, res, next) => {
  let permissionString = expr;
  let variables = permissionString.match(/\$\w+/g);
  let accessibles = consolidateAllPermission(req.currentEmployee.roles);

  variables.forEach((variable) => {
    let permission = variable.substr(1);
    let isAccessible = accessibles.indexOf(permission) > -1;
    let all = permissionString.split(`$${permission}`);
    permissionString = all.join(isAccessible);
  });

  let isAccessible = eval(permissionString);

  if (isAccessible) next();
  else {
    res.status(401).send({
      error: 'Not Authorised',
    });
  }
};

const authorizeRoles = (expr) => (req, res, next) => {
  let permissionString = expr;
  let variables = permissionString.match(/\$\w+/g);
  const allAssignedRoles = req.currentEmployee.roles.map((role) => role.name);

  variables.forEach((role) => {
    let permission = role.substr(1);
    let isAccessible = allAssignedRoles.indexOf(permission) > -1;
    let all = permissionString.split(`$${permission}`);
    permissionString = all.join(isAccessible);
  });

  let isAccessible = eval(permissionString);

  if (isAccessible) next();
  else {
    res.status(401).send({
      error: 'Not Authorised',
    });
  }
};


module.exports = {
  authorize,
  expression,
}
;

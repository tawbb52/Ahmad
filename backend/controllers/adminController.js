function required(fields, body) {
  const missing = fields.filter((field) => !body[field]);
  return missing.length ? `Missing required fields: ${missing.join(", ")}` : null;
}

function createAdminController({ store }) {
  return {
    health(_req, res) {
      return res.json({ status: "ok", service: "ahmad-admin-api" });
    },

    overview(_req, res) {
      return res.json(store.listOverview());
    },

    listUsers(req, res) {
      return res.json(store.listUsers(req.query));
    },

    createUser(req, res) {
      const message = required(["name", "email"], req.body || {});
      if (message) {
        return res.status(400).json({ message });
      }

      return res.status(201).json(store.createUser(req.body));
    },

    updateUser(req, res) {
      const user = store.updateUser(req.params.id, req.body || {});
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json(user);
    },

    deleteUser(req, res) {
      const removed = store.deleteUser(req.params.id);
      if (!removed) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.status(204).send();
    },

    listDevices(req, res) {
      return res.json(store.listDevices(req.query));
    },

    createDevice(req, res) {
      const message = required(["userId", "model", "iosVersion", "udid"], req.body || {});
      if (message) {
        return res.status(400).json({ message });
      }

      return res.status(201).json(store.createDevice(req.body));
    },

    updateDevice(req, res) {
      const device = store.updateDevice(req.params.id, req.body || {});
      if (!device) {
        return res.status(404).json({ message: "Device not found." });
      }

      return res.json(device);
    },

    deleteDevice(req, res) {
      const removed = store.deleteDevice(req.params.id);
      if (!removed) {
        return res.status(404).json({ message: "Device not found." });
      }

      return res.status(204).send();
    },

    listPlans(_req, res) {
      return res.json(store.listPlans());
    },

    listSubscriptions(req, res) {
      return res.json(store.listSubscriptions(req.query));
    },

    renewSubscription(req, res) {
      const message = required(["userId", "startDate", "endDate"], req.body || {});
      if (message) {
        return res.status(400).json({ message });
      }

      const subscription = store.renewSubscription(req.body);
      if (!subscription) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json(subscription);
    },

    listCertificates(req, res) {
      return res.json(store.listCertificates(req.query));
    },

    createCertificate(req, res) {
      const message = required(["name", "type", "expiresAt"], req.body || {});
      if (message) {
        return res.status(400).json({ message });
      }

      return res.status(201).json(store.createCertificate(req.body));
    },

    updateCertificate(req, res) {
      const certificate = store.updateCertificate(req.params.id, req.body || {});
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found." });
      }

      return res.json(certificate);
    },

    deleteCertificate(req, res) {
      const removed = store.deleteCertificate(req.params.id);
      if (!removed) {
        return res.status(404).json({ message: "Certificate not found." });
      }

      return res.status(204).send();
    },

    listCodes(req, res) {
      return res.json(store.listCodes(req.query));
    },

    createCode(req, res) {
      const message = required(["expiresAt"], req.body || {});
      if (message) {
        return res.status(400).json({ message });
      }

      return res.status(201).json(store.createCode(req.body));
    },

    deleteCode(req, res) {
      const removed = store.deleteCode(req.params.id);
      if (!removed) {
        return res.status(404).json({ message: "Activation code not found." });
      }

      return res.status(204).send();
    },

    listActivityLogs(req, res) {
      return res.json(store.listActivityLogs(req.query));
    },
  };
}

module.exports = { createAdminController };

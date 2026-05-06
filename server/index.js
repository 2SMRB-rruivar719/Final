import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

// MongoDB connection (default port 27017)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/travelmatch";

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB conectado", {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    dbName: mongoose.connection.name,
  });
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB desconectado");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Evento de error de MongoDB", { message: err?.message });
});

// Middlewares
// Permitimos todas las procedencias para facilitar desarrollo y despliegue
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "travelmatch-api",
    mongoState: mongoose.connection.readyState,
    mongoStateLabel:
      mongoose.connection.readyState === 1
        ? "connected"
        : mongoose.connection.readyState === 2
          ? "connecting"
          : mongoose.connection.readyState === 3
            ? "disconnecting"
            : "disconnected",
  });
});

// Esquema de usuario con credenciales y rol
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["cliente", "empresa"], required: true },
    age: { type: Number, default: 25 },
    country: { type: String, default: "Global" },
    bio: { type: String, default: "Listo para viajar!" },
    budget: { type: String, enum: ["Bajo", "Medio", "Alto"], default: "Medio" },
    travelStyle: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    avatarUrl: { type: String, default: "https://picsum.photos/seed/me/400/400" },
    destination: { type: String, required: true },
    dates: { type: String, default: "Próximamente" },
    language: { type: String, enum: ["es", "en"], default: "es" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    // Mapear _id -> id y limpiar campos internos
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

// Registro
app.post("/api/auth/register", async (req, res) => {
  const requestStartedAt = Date.now();
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      country,
      bio,
      budget,
      travelStyle,
      interests,
      avatarUrl,
      destination,
      dates,
      language,
      theme,
    } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" && name.trim()
      ? name.trim()
      : (normalizedEmail.split("@")[0] || "Viajero");
    const normalizedRole = role === "empresa" ? "empresa" : "cliente";
    const normalizedDestination = typeof destination === "string" && destination.trim()
      ? destination.trim()
      : "Sin destino";

    console.log("[SERVER][REGISTER] Request entrante", {
      path: req.path,
      method: req.method,
      ip: req.ip,
      bodyPreview: {
        ...req.body,
        password: typeof password === "string" ? `***hidden***(${password.length})` : "missing-or-invalid",
      },
    });

    // Validaciones mínimas: solo email y contraseña
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.warn("[SERVER][REGISTER] Validación fallida", { reason: "email_required", email });
      return res.status(400).json({ error: "El email es obligatorio." });
    }
    
    if (!password || typeof password !== 'string') {
      console.warn("[SERVER][REGISTER] Validación fallida", {
        reason: "password_required",
        passwordType: typeof password,
      });
      return res.status(400).json({ error: "La contraseña es obligatoria." });
    }
    
    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      console.warn("[SERVER][REGISTER] Validación fallida", {
        reason: "email_format_invalid",
        email,
      });
      return res.status(400).json({ error: "El email debe tener un formato válido (ejemplo@dominio.com)." });
    }

    if (password.length < 6) {
      console.warn("[SERVER][REGISTER] Validación fallida", {
        reason: "password_too_short",
        passwordLength: password.length,
      });
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    console.log("[SERVER][REGISTER] Buscando email existente", { email: email.trim().toLowerCase() });
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.warn("[SERVER][REGISTER] Email duplicado", { email });
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    console.log("[SERVER][REGISTER] Generando hash de contraseña", { rounds: 10 });
    const passwordHash = await bcrypt.hash(password, 10);

    // Limpiar valores undefined para que MongoDB use los defaults del schema
    const userData = {
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
      destination: normalizedDestination,
    };
    
    // Solo añadir campos opcionales si tienen valor
    if (age !== undefined && age !== null) userData.age = Number(age);
    if (country && country.trim()) userData.country = country.trim();
    if (bio && bio.trim()) userData.bio = bio.trim();
    if (budget) userData.budget = budget;
    if (travelStyle && Array.isArray(travelStyle)) userData.travelStyle = travelStyle;
    if (interests && Array.isArray(interests)) userData.interests = interests;
    if (avatarUrl && avatarUrl.trim()) userData.avatarUrl = avatarUrl.trim();
    if (dates && dates.trim()) userData.dates = dates.trim();
    if (language) userData.language = language;
    if (theme) userData.theme = theme;

    console.log("[SERVER][REGISTER] Payload final para Mongo", {
      ...userData,
      passwordHashLength: passwordHash.length,
    });

    const user = await User.create(userData);

    console.log("[SERVER][REGISTER] Usuario creado correctamente", {
      elapsedMs: Date.now() - requestStartedAt,
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json(user.toJSON());
  } catch (err) {
    console.error("[SERVER][REGISTER] Error en registro", {
      elapsedMs: Date.now() - requestStartedAt,
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      rawError: err,
    });

    // Email duplicado (por índice único en Mongo)
    if (err && err.code === 11000) {
      console.warn("[SERVER][REGISTER] Error de índice único (email duplicado)");
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    // Errores de conexión o de servidor Mongo
    const msg = typeof err?.message === "string" ? err.message : "";
    if (
      msg.includes("ECONNREFUSED") ||
      msg.toLowerCase().includes("failed to connect") ||
      msg.toLowerCase().includes("server selection")
    ) {
      console.error("[SERVER][REGISTER] Error de conexión a MongoDB detectado", { msg });
      return res.status(500).json({
        error:
          "No se pudo conectar a la base de datos. Asegúrate de que MongoDB esté en ejecución y que la URI sea correcta.",
      });
    }

    if (err?.name === "ValidationError") {
      const firstValidationMessage = Object.values(err.errors || {})
        .map((entry) => entry?.message)
        .find(Boolean);
      return res.status(400).json({
        error: firstValidationMessage || "Datos de registro inválidos.",
      });
    }

    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios." });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    res.json(user.toJSON());
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Actualizar usuario (incluye idioma)
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    // Nunca permitir actualizar passwordHash directamente
    delete update.passwordHash;

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user.toJSON());
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

const startServer = async () => {
  try {
    console.log("[SERVER][BOOT] Conectando con MongoDB...", {
      uri: MONGODB_URI.replace(/:\/\/([^@]+)@/, "://***:***@"),
    });

    await mongoose.connect(MONGODB_URI, {
      dbName: "travelmatch",
      serverSelectionTimeoutMS: 5000,
    });

    app.listen(PORT, () => {
      console.log(`🚀 API de TravelMatch escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar la API por fallo de MongoDB", {
      message: err?.message,
    });
    process.exit(1);
  }
};

startServer();


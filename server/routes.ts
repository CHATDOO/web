import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertCarSchema } from "@shared/schema";
import path from "path";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import carUploadRoutes from "./routes/carUploadRoutes";
import serverParserRoutes from "./routes/serverParserRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure session
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'les-affranchis-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production'
    }
  }));
  
  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // AUTH ROUTES
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ success: true, user: req.user });
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
  
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: req.user });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  // SERVER ROUTES
  app.get('/api/servers', async (req, res) => {
    try {
      const { category } = req.query;
      let servers;
      
      if (category && typeof category === 'string') {
        servers = await storage.getServersByCategory(category);
      } else {
        servers = await storage.getAllServers();
      }
      
      res.json(servers);
    } catch (error) {
      console.error('Error fetching servers:', error);
      res.status(500).json({ message: 'Failed to fetch servers' });
    }
  });
  
  app.get('/api/servers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const server = await storage.getServerById(id);
      
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      res.json(server);
    } catch (error) {
      console.error('Error fetching server:', error);
      res.status(500).json({ message: 'Failed to fetch server' });
    }
  });
  
  app.post('/api/servers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid server data', errors: error.errors });
      }
      console.error('Error creating server:', error);
      res.status(500).json({ message: 'Failed to create server' });
    }
  });
  
  app.patch('/api/servers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const server = await storage.getServerById(id);
      
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      const validatedData = insertServerSchema.partial().parse(req.body);
      const updatedServer = await storage.updateServer(id, validatedData);
      res.json(updatedServer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid server data', errors: error.errors });
      }
      console.error('Error updating server:', error);
      res.status(500).json({ message: 'Failed to update server' });
    }
  });
  
  app.delete('/api/servers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteServer(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting server:', error);
      res.status(500).json({ message: 'Failed to delete server' });
    }
  });
  
  // CAR ROUTES
  app.get('/api/cars', async (req, res) => {
    try {
      const { category, serverId } = req.query;
      let cars;
      
      if (category && typeof category === 'string') {
        cars = await storage.getCarsByCategory(category);
      } else if (serverId && typeof serverId === 'string') {
        cars = await storage.getCarsByServer(parseInt(serverId));
      } else {
        cars = await storage.getAllCars();
      }
      
      res.json(cars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ message: 'Failed to fetch cars' });
    }
  });
  
  app.get('/api/cars/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCarById(id);
      
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }
      
      res.json(car);
    } catch (error) {
      console.error('Error fetching car:', error);
      res.status(500).json({ message: 'Failed to fetch car' });
    }
  });
  
  app.post('/api/cars', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(validatedData);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid car data', errors: error.errors });
      }
      console.error('Error creating car:', error);
      res.status(500).json({ message: 'Failed to create car' });
    }
  });
  
  app.patch('/api/cars/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCarById(id);
      
      if (!car) {
        return res.status(404).json({ message: 'Car not found' });
      }
      
      const validatedData = insertCarSchema.partial().parse(req.body);
      const updatedCar = await storage.updateCar(id, validatedData);
      res.json(updatedCar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid car data', errors: error.errors });
      }
      console.error('Error updating car:', error);
      res.status(500).json({ message: 'Failed to update car' });
    }
  });
  
  app.delete('/api/cars/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCar(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Car not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting car:', error);
      res.status(500).json({ message: 'Failed to delete car' });
    }
  });
  
  // Use specialized upload and download routes for cars
  app.use('/api/cars', carUploadRoutes);
  
  // Use specialized server parser routes
  app.use('/api/servers', serverParserRoutes);

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      const cars = await storage.getAllCars();
      
      const stats = {
        serverCount: servers.length,
        carCount: cars.length,
        playerCount: servers.reduce((sum, server) => sum + server.currentPlayers, 0),
        availability: "24/7"
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  return httpServer;
}

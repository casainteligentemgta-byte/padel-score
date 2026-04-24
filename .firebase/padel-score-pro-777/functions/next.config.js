"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// next.config.js
var next_config_exports = {};
__export(next_config_exports, {
  default: () => next_config_default
});
module.exports = __toCommonJS(next_config_exports);
var import_next_pwa = __toESM(require("@ducanh2912/next-pwa"), 1);
var customCaching = [
  // Nunca cachear Supabase REST/Realtimes para que el live scoring no se congele
  {
    urlPattern: /^https?:\/\/[^/]+\.supabase\.co\/rest\/.*/i,
    handler: "NetworkOnly",
    options: {
      cacheName: "supabase-rest-network-only"
    }
  },
  {
    urlPattern: /^https?:\/\/[^/]+\.supabase\.co\/realtime\/.*/i,
    handler: "NetworkOnly",
    options: {
      cacheName: "supabase-realtime-network-only"
    }
  },
  // Resto: usar configuración por defecto de next-pwa
  ...import_next_pwa.runtimeCaching
];
var pwa = (0, import_next_pwa.default)({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: customCaching,
  extendDefaultRuntimeCaching: false
});
var nextConfig = {
  // Next 16 usa Turbopack por defecto; esta config evita error de detección
  // cuando next-pwa inyecta configuración webpack.
  turbopack: {},
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ]
  },
  async redirects() {
    return [
      { source: "/p", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/pizarra", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/pizarra/:path*", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/tv", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/p/:court", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/marker/:canchaId", destination: "/dev/pizarra-concept", permanent: false },
      {
        source: "/display/court/:courtId",
        destination: "/dev/pizarra-concept?courtId=:courtId",
        permanent: false
      },
      { source: "/display/tv/:courtId", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/display/stream/court/:courtId", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/display/ads", destination: "/dev/pizarra-concept", permanent: false },
      { source: "/display/:id", destination: "/dev/pizarra-concept", permanent: false },
      {
        source: "/tournaments/:id/display/bracket",
        destination: "/dev/pizarra-concept?tournamentId=:id&view=bracket",
        permanent: false
      },
      {
        source: "/tournaments/:id/display/court/:courtId",
        destination: "/dev/pizarra-concept?tournamentId=:id&courtId=:courtId",
        permanent: false
      },
      {
        source: "/tournaments/:id/display/:matchId",
        destination: "/dev/pizarra-concept?tournamentId=:id&matchId=:matchId",
        permanent: false
      }
    ];
  },
  async rewrites() {
    return [];
  }
};
var next_config_default = pwa(nextConfig);

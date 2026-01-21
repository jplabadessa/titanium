import { createServer } from "node:http";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// Imports Ultraviolet
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const ENVATO_COOKIE = process.env.ENVATO_COOKIE || "";
const FIXED_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// 1. LIMPEZA DE HEADERS (Essencial para não ser detectado)
				// Remove headers que o Node.js ou o cPanel adicionam e que "denunciam" o proxy
				delete req.headers["x-forwarded-for"];
				delete req.headers["x-real-ip"];
				delete req.headers["via"];
				delete req.headers["forwarded"];

				// 2. BLOQUEIO DE LOGOUT
				if (req.url.includes("logout") || req.url.includes("sign-out")) {
					res.writeHead(403);
					res.end("Ação Proibida");
					return;
				}

				// 3. INJEÇÃO DE IDENTIDADE REAL
				// Forçamos o host e a origem para parecerem requisições nativas
				if (req.url.includes("/service/")) {
					req.headers["cookie"] = ENVATO_COOKIE;
					req.headers["user-agent"] = FIXED_UA;
					req.headers["origin"] = "https://elements.envato.com";
					req.headers["referer"] = "https://elements.envato.com/";
				}

				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				if (req.url.endsWith("/wisp/")) {
					req.headers["cookie"] = ENVATO_COOKIE;
					req.headers["user-agent"] = FIXED_UA;
					wisp.routeRequest(req, socket, head);
				} else {
					socket.end();
				}
			});
	},
});

// Registro de rotas (mantido conforme seu padrão)
fastify.register(fastifyStatic, { root: publicPath, decorateReply: true });
fastify.get("/uv/uv.config.js", (req, res) => res.sendFile("uv/uv.config.js", publicPath));
fastify.register(fastifyStatic, { root: uvPath, prefix: "/uv/", decorateReply: false });
fastify.register(fastifyStatic, { root: epoxyPath, prefix: "/epoxy/", decorateReply: false });
fastify.register(fastifyStatic, { root: baremuxPath, prefix: "/baremux/", decorateReply: false });

let port = parseInt(process.env.PORT || "8080");
fastify.listen({ port: port, host: "0.0.0.0" });

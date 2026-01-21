import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// Caminhos estáticos das bibliotecas de proxy
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

/**
 * CONFIGURAÇÃO DA SESSÃO ENVATO
 * Recomenda-se colocar a string de cookies no painel do Koyeb/cPanel 
 * como uma variável de ambiente chamada ENVATO_COOKIE.
 */
const ENVATO_COOKIE = process.env.ENVATO_COOKIE || "__cf_bm=VfnjJpaMMrQIu4aw2Z1LU7Bcoe.XAelzVn9ttANWX5w-1768956396-1.0.1.1-4SwYajjUwWpDBp1qzWTz4obHc5xMBMlzeNOtj87kxNXztISdNNOb1F.2Z3mnXoaeLsNjm8OTTXXWDxp83.0muvGxNorMSx2.cpxI96K.D5Q; __cf_bm=Dffza8SVw2luaWlqf9bARfuDETU.MgeVqxjVu2.ia24-1768956396-1.0.1.1-vhnuOCWix2i.Ft11iD.1a5cmbPvAKsHzH30uroo.ANtN1vx_pWqEsrGdRunJ_gGzPRZ6UycxQjR_LVqn1ufMwrVQOyfUWAQhpUjlcXsXOiU; _ce.s=lcw~1768867931438~v11ls~a9b37240-f594-11f0-ac67-e9e500da71dc~v~a2fba6a5545a88fb17c5f68b05deddbef34b2c9a~vir~returning~lva~1768867929806~vpv~8~v11.cs~229985~v11.s~a9b37240-f594-11f0-ac67-e9e500da71dc~v11.vs~a2fba6a5545a88fb17c5f68b05deddbef34b2c9a~v11.fsvd~eyJ1cmwiOiJlbGVtZW50cy5lbnZhdG8uY29tL3B0LWJyL3NpZ24taW4iLCJyZWYiOiIiLCJ1dG0iOltdfQ%3D%3D~v11.sla~1768867929964~gtrk.la~mkluatsj~lcw~1768867940179; _cfuvid=K8elp1E0tgsP_pdRFmwRdAurtWUuavSAlI3qo9mzzK0-1768866363656-0.0.1.1-604800000; _fbp=fb.1.1765721888164.990087147336987627; _ga=GA1.1.417834912.1765721875; _ga_49PPXBVNM9=GS2.1.s1768866437$o12$g1$t1768867942$j47$l0$h2047036062; _ga_P25W8FT6F7=GS2.1.s1768866368$o1$g1$t1768867952$j35$l0$h0; _ga_SFZC8HJ4D7=GS2.1.s1768955395$o25$g1$t1768956400$j60$l0$h0; _ga_TBMDZ2KVV9=GS2.1.s1767810320$o10$g1$t1767812199$j55$l0$h0; _gcl_au=1.1.1295564565.1765721887; _hjDonePolls=1837725; _hjSession_6538619=eyJpZCI6ImQyZDIyMjVkLTEyMzEtNDNmOC1iZDc0LWJlNDhmNzFlM2VhMSIsImMiOjE3Njg5NTUzOTQ4NDEsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; _hjSessionUser_3757350=eyJpZCI6ImYwYzlkMjdiLWZlNjEtNTI2OC05NzRhLTRmNmI1NGIzYmNlMCIsImNyZWF0ZWQiOjE3NjYxMDMxOTM2NTUsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_6538619=eyJpZCI6IjUxMzliOWNiLWQzY2MtNTZkYi05YTM4LTcyZWE0MzZmMDgwNyIsImNyZWF0ZWQiOjE3Njg4NjYzODU5MTksImV4aXN0aW5nIjp0cnVlfQ==; _rdt_uuid=1765721886992.06f3db19-56b2-4544-a904-6e779cde3eb6; _uetvid=b6c0b9b0d8f711f099c7957aa53da720; AMP_e20024aa5a=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjI4MzViNjAwYy05NjVhLTQyNDUtOTRkOC0yYWYzOTJiMGQwY2IlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI5YjYyYmIxZC1hNjBiLTQyOTctYTgzYi1lZDFhNzE0ODQ0NWIlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY3ODEwMzE5MjQ5JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2NzgxMTY1Nzk5NyUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTk0NyUyQyUyMnBhZ2VDb3VudGVyJTIyJTNBMTElN0Q=; AMP_e968c0d507=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjJiM2ZlMTU4YS1iMmE3LTQyNDktYWNkMi1jMTE5ZThhNjI3OTIlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI5YjYyYmIxZC1hNjBiLTQyOTctYTgzYi1lZDFhNzE0ODQ0NWIlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY4OTU1Mzk0OTcxJTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2ODk1NjQwMDYxMSUyQyUyMmxhc3RFdmVudElkJTIyJTNBMzc5JTJDJTIycGFnZUNvdW50ZXIlMjIlM0EwJTdE; AMP_MKTG_e20024aa5a=JTdCJTdE; AMP_MKTG_e968c0d507=JTdCJTdE; cebs=1; cebsp_=1; CONFIGCAT_EXP_ENVATO=306e2285-134a-4ff7-8393-f2fa71c461ee=0&1c55a499-78e1-4626-9984-e6cebe3bd93b=1&7ab92939-3ca7-4e67-8382-ed5082ee4f15=1&2270703e-1824-49a0-a167-b01349273659=0&6d1013b0-572a-4f83-b55a-f7f6655b8f34=0&a7f3e9c1-4b8d-4e2a-9f6c-3d5e8a1b4c7f=1; envatoid=eyJraWQiOiJpZHRva2VuMjAyNDA4MjIiLCJhbGciOiJSUzI1NiJ9.eyJnaXZlbl9uYW1lIjoibGFiYWRlc3NhIiwiZmFtaWx5X25hbWUiOiJqb2FvIiwibmlja25hbWUiOiJsYWJhZGVzc2FqIiwic3ViIjoiOWI2MmJiMWQtYTYwYi00Mjk3LWE4M2ItZWQxYTcxNDg0NDViIiwibWZhIjpmYWxzZSwic2lkIjoiZTU1Zjg5NWU1MDJjNGVmZWE5ZjBiYmRjOGY3YTI3ZTgiLCJhdWQiOiIuZW52YXRvLmNvbSIsImV4cCI6MTc3MDE2NTk5NiwiaWF0IjoxNzY4OTU2Mzk2fQ.FEALpD_t3grB2etdnP-sKHcAFuEDZdXI0SrJYPym1jHpsDUGTLCMZURmN-MtIGnydXL36VvCQwsAw0BGNZpY6Hx_wXcxshU13yVSM4AvgU0LIHF94USUCohQXyJof7q36L1Gdu9YFmzo7_ewn7IqkOJzzp8R-s20X98JO9CYU9liis8qi0E7uYDjK7H3DvirXZzFg3CUKGe7J2YXjzT2WfpVlI2YrIjL9IMetduOcZa5y79DRI63Xe9tw0AklH9opxMRZuKqq3Ksg2PglNdruDN57oNU0dDOl3EU00sEvyk6wUefQfsMSBDu1keGfPXzm8__8XIs-MtiWNpiWFaUrg; preferredLanguage=pt-BR; _dd_s=aid=534fbc9a-e29f-4e49-9c94-f65721a4f35b&rum=2&id=dbd8d72c-d22b-4e77-abbd-7830f528b184&created=1768955394377&expire=1768957299719; _hjHasCachedUserAttributes=true; CookieConsent={stamp:%27ezJuQjarrmIgYNAf/+tSU2oR/CjMRE/oFIJcKh7qSlLiYPutHOYLEw==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1768866383293%2Cregion:%27br%27}";

// User-Agent fixo para evitar que o Envato detecte múltiplos dispositivos diferentes
const FIXED_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// 1. BLOQUEIO DE SEGURANÇA: Impede que qualquer usuário deslogue a conta principal
				if (req.url.includes("/logout") || req.url.includes("/sign-out") || req.url.includes("/exit")) {
					res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
					res.end("Ação bloqueada: O logout foi desativado para proteger a sessão coletiva.");
					return;
				}

				// 2. INJEÇÃO DE HEADERS: Injeta cookies e mascara o navegador
				// Aplicamos a todos os requests que passam pelo servidor para garantir consistência
				req.headers["cookie"] = ENVATO_COOKIE;
				req.headers["user-agent"] = FIXED_UA;

				// Headers obrigatórios para o funcionamento do Ultraviolet (SharedArrayBuffer)
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				// 3. INJEÇÃO NO PROTOCOLO WISP: Garante que o tráfego WebSocket também esteja autenticado
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

// --- REGISTRO DE ROTAS ESTÁTICAS ---

fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/uv/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

// --- INICIALIZAÇÃO E LOGS ---

fastify.server.on("listening", () => {
	const address = fastify.server.address();
	console.log(`
  🌐 Proxy de Compartilhamento Ativo!
  ----------------------------------
  Endereço Local: http://localhost:${address.port}
  Hostname: http://${hostname()}:${address.port}
  Status da Sessão: ${ENVATO_COOKIE ? "✅ Cookie Injetado" : "⚠️ Sem Cookie"}
  ----------------------------------
  `);
});

// Gerenciamento de encerramento limpo
function shutdown() {
	console.log("Recebido sinal de encerramento. Fechando servidor...");
	fastify.close();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

let port = parseInt(process.env.PORT || "8080");

fastify.listen({
	port: port,
	host: "0.0.0.0",
});

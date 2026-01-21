import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// Imports das bibliotecas Ultraviolet
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// CONFIGURAÇÃO - Use variáveis de ambiente no Koyeb ou cole sua string abaixo
const ENVATO_COOKIE = process.env.ENVATO_COOKIE || "__cf_bm=Dffza8SVw2luaWlqf9bARfuDETU.MgeVqxjVu2.ia24-1768956396-1.0.1.1-vhnuOCWix2i.Ft11iD.1a5cmbPvAKsHzH30uroo.ANtN1vx_pWqEsrGdRunJ_gGzPRZ6UycxQjR_LVqn1ufMwrVQOyfUWAQhpUjlcXsXOiU; _ce.s=lcw~1768867931438~v11ls~a9b37240-f594-11f0-ac67-e9e500da71dc~v~a2fba6a5545a88fb17c5f68b05deddbef34b2c9a~vir~returning~lva~1768867929806~vpv~8~v11.cs~229985~v11.s~a9b37240-f594-11f0-ac67-e9e500da71dc~v11.vs~a2fba6a5545a88fb17c5f68b05deddbef34b2c9a~v11.fsvd~eyJ1cmwiOiJlbGVtZW50cy5lbnZhdG8uY29tL3B0LWJyL3NpZ24taW4iLCJyZWYiOiIiLCJ1dG0iOltdfQ%3D%3D~v11.sla~1768867929964~gtrk.la~mkluatsj~lcw~1768867940179; _cfuvid=K8elp1E0tgsP_pdRFmwRdAurtWUuavSAlI3qo9mzzK0-1768866363656-0.0.1.1-604800000; _fbp=fb.1.1765721888164.990087147336987627; _ga=GA1.1.417834912.1765721875; _ga_49PPXBVNM9=GS2.1.s1768866437$o12$g1$t1768867942$j47$l0$h2047036062; _ga_P25W8FT6F7=GS2.1.s1768956857$o2$g1$t1768956875$j42$l0$h0; _ga_SFZC8HJ4D7=GS2.1.s1768955395$o25$g1$t1768956877$j37$l0$h0; _ga_TBMDZ2KVV9=GS2.1.s1767810320$o10$g1$t1767812199$j55$l0$h0; _gcl_au=1.1.1295564565.1765721887; _hjDonePolls=1837725; _hjSession_6538619=eyJpZCI6ImQyZDIyMjVkLTEyMzEtNDNmOC1iZDc0LWJlNDhmNzFlM2VhMSIsImMiOjE3Njg5NTUzOTQ4NDEsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; _hjSessionUser_3757350=eyJpZCI6ImYwYzlkMjdiLWZlNjEtNTI2OC05NzRhLTRmNmI1NGIzYmNlMCIsImNyZWF0ZWQiOjE3NjYxMDMxOTM2NTUsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_6538619=eyJpZCI6IjUxMzliOWNiLWQzY2MtNTZkYi05YTM4LTcyZWE0MzZmMDgwNyIsImNyZWF0ZWQiOjE3Njg4NjYzODU5MTksImV4aXN0aW5nIjp0cnVlfQ==; _rdt_uuid=1765721886992.06f3db19-56b2-4544-a904-6e779cde3eb6; _uetvid=b6c0b9b0d8f711f099c7957aa53da720; AMP_e20024aa5a=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjI4MzViNjAwYy05NjVhLTQyNDUtOTRkOC0yYWYzOTJiMGQwY2IlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI5YjYyYmIxZC1hNjBiLTQyOTctYTgzYi1lZDFhNzE0ODQ0NWIlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY3ODEwMzE5MjQ5JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2NzgxMTY1Nzk5NyUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTk0NyUyQyUyMnBhZ2VDb3VudGVyJTIyJTNBMTElN0Q=; AMP_e968c0d507=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjJiM2ZlMTU4YS1iMmE3LTQyNDktYWNkMi1jMTE5ZThhNjI3OTIlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjI5YjYyYmIxZC1hNjBiLTQyOTctYTgzYi1lZDFhNzE0ODQ0NWIlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzY4OTU1Mzk0OTcxJTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc2ODk1Njg1NDU2MCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMzgyJTJDJTIycGFnZUNvdW50ZXIlMjIlM0EwJTdE; AMP_MKTG_e20024aa5a=JTdCJTdE; AMP_MKTG_e968c0d507=JTdCJTdE; cebs=1; cebsp_=1; CONFIGCAT_EXP_ENVATO=306e2285-134a-4ff7-8393-f2fa71c461ee=0&1c55a499-78e1-4626-9984-e6cebe3bd93b=1&7ab92939-3ca7-4e67-8382-ed5082ee4f15=1&2270703e-1824-49a0-a167-b01349273659=0&6d1013b0-572a-4f83-b55a-f7f6655b8f34=0&a7f3e9c1-4b8d-4e2a-9f6c-3d5e8a1b4c7f=1; envatoid=eyJraWQiOiJpZHRva2VuMjAyNDA4MjIiLCJhbGciOiJSUzI1NiJ9.eyJnaXZlbl9uYW1lIjoibGFiYWRlc3NhIiwiZmFtaWx5X25hbWUiOiJqb2FvIiwibmlja25hbWUiOiJsYWJhZGVzc2FqIiwic3ViIjoiOWI2MmJiMWQtYTYwYi00Mjk3LWE4M2ItZWQxYTcxNDg0NDViIiwibWZhIjpmYWxzZSwic2lkIjoiYTk0NGZiYWNmOTY0NDRlYmE2ODg3OGFkMjc1OTY0NGQiLCJhdWQiOiIuZW52YXRvLmNvbSIsImV4cCI6MTc3MDE2NjQ3MywiaWF0IjoxNzY4OTU2ODczfQ.DEVfIgIlIULzTouo4vDZ5TF2DNUcSLANTf4kdK-AHRnNUGKpRBH3juaN8b79TSqkU2DP8Nme1rPTI1U4lHxc5NDyY4SinYg6bPGthktPmXhur2InZYvFlCLUgmEGsMYMB0Ek4B05UBGGsRvFpi4BsOSgcySVlBrw07GI31JJYnUlIEaK3tw_RvV1WcL0tBoVbJQR_pq_NrglhvkUZTbuoa4v4JNNgum5Jfimu4Bbw8NAp4mo2QIPgxSQte20GI9w6x4KqpAgPvh1MS-GiU9jvHE4SdiL_r2ZrVxRFp_BwLRMWQSgjPKxRt4YveOge28P3VzPtDzrmVNn70R00JvuNw; preferredLanguage=pt-BR; _dd_s=aid=fa9bb37c-9feb-4e1b-90cb-797e43ebd7d1&rum=2&id=139c7d0f-58e9-44d9-95c3-f5c76fee8998&created=1768956856532&expire=1768957878741; btt=3ebdd1131735465883a52419688ec1e1-sngRExOH97; CookieConsent={stamp:%27xhoQufc5ve6Uvmd532nWjIlRrz/e9KpDCS9RncRTziQT0H2fM0eOmw==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27explicit%27%2Cver:1%2Cutc:1768866365111%2Cregion:%27br%27}; envatosession=Ek%2FHUXPGvDiaGOwmzieqj7akq1nUZknI9Xt12j1fbkelg%2B5tHYNVP4i80rohavA5zmsVJsjq%2BmIRBGtgFw6pJagsMcuEhYmYuiYysjvIzPur3t1VO%2BVtYG1%2BQ102Mt04hQeGx6wys1tuPYfvdNyMIygWtTCGviLMLLtWZ3cbRgbogE0s0y4zwFILZa0yCUbFswDL0mwD%2BR0N%2BjRKCFFqZyO%2FAcCkLvGv6XLS%2F9IcEh%2FbmUC6RcYru7WLkUr2%2FQ72QVntIY4hZi%2FUFTCwZf8%2BGCxdjgDQj2PjIxqpd9mz6h%2FHMpaMud2Zg1KCE1jTbFBIwlK9zPYP%2FPpxtP6KEN8nwQr6emqFfcsdWfjC97nnOi1MSxEUgD8J5pcTvVEB0xHtir6B--4AyUF4goKhHp44hp--TAY4c4hw44L3823C0ox6Fg%3D%3D; referring_client=envatoapp";
const FIXED_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				// 1. BLOQUEIO DE LOGOUT
				// Impede que usuários cliquem em 'Sair' e matem sua sessão
				if (req.url.includes("logout") || req.url.includes("sign-out") || req.url.includes("exit")) {
					res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
					res.end("Logout desativado para segurança da conta coletiva.");
					return;
				}

				// 2. INJEÇÃO GLOBAL (Resolve o problema de aparecer deslogado)
				// Injetamos em todas as rotas que não são arquivos locais (/uv/, /epoxy/, etc)
				// Isso garante que mesmo URLs codificadas recebam seu login.
				if (req.url.includes("/service/") || req.url.includes("/bare/")) {
					req.headers["cookie"] = ENVATO_COOKIE;
					req.headers["user-agent"] = FIXED_UA;
				}

				// Headers necessários para o isolamento do navegador (Ultraviolet)
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				// 3. INJEÇÃO NO PROTOCOLO WISP
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

// Registro dos arquivos estáticos do front-end
fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.register(fastifyStatic, { root: uvPath, prefix: "/uv/", decorateReply: false });
fastify.register(fastifyStatic, { root: epoxyPath, prefix: "/epoxy/", decorateReply: false });
fastify.register(fastifyStatic, { root: baremuxPath, prefix: "/baremux/", decorateReply: false });

fastify.server.on("listening", () => {
	const address = fastify.server.address();
	console.log(`🚀 Proxy Online: http://${hostname()}:${address.port}`);
});

function shutdown() {
	fastify.close();
	process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

let port = parseInt(process.env.PORT || "8080");
fastify.listen({ port: port, host: "0.0.0.0" });

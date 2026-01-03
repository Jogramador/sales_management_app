import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
        credentials: "include", // Importante para enviar cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao fazer login");
      }

      const data = await response.json();
      toast.success(`Bem-vindo, ${data.user.name}!`);
      
      // Redireciona para a página inicial
      setLocation("/");
      
      // Recarrega a página para atualizar o estado de autenticação
      window.location.reload();
    } catch (error) {
      console.error("[Login] Error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Login</h1>
            <p className="text-muted-foreground mt-2">
              Entre com seu nome para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground block mb-2">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                disabled={isLoading}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

        </div>
      </Card>
    </div>
  );
}









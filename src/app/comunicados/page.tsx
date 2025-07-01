
"use client"
import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { PlusCircle, MessageSquare, Bot, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Announcement } from "@/lib/types"
import { AnnouncementForm, AnnouncementFormValues } from "@/components/announcement-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateConversation } from "@/ai/flows/generate-conversation-flow"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useHasPermission } from "@/hooks/use-has-permission"


export default function ComunicadosPage() {
  const isAuthorized = useRequireAuth('Ver Comunicados');
  const canPublish = useHasPermission('Publicar Comunicados');

  const { announcements, setAnnouncements, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [scenario, setScenario] = useState("");
  const [conversation, setConversation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const employeeList = users.filter(u => u.role === 'employee');


  const handleSave = (values: AnnouncementFormValues) => {
    const newAnnouncement: Announcement = {
      id: String(Date.now()),
      title: values.title,
      content: values.content,
      date: new Date().toISOString().split('T')[0],
      categories: ["Geral"], // Placeholder
      priority: "medium", // Placeholder
    };
    setAnnouncements(prev => [newAnnouncement, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
  }

  const handleGenerateConversation = async () => {
    if (!user1 || !user2 || user1 === user2) {
      setConversation("Por favor, selecione dois funcionários diferentes.");
      return;
    }
    setIsLoading(true);
    setConversation("");
    try {
      const result = await generateConversation({
        user1: users.find(u => u.id === user1)?.name || "",
        user2: users.find(u => u.id === user2)?.name || "",
        scenario: scenario
      });
      setConversation(result);
    } catch (error) {
      console.error(error);
      setConversation("Ocorreu um erro ao gerar a conversa. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityVariant = (priority: Announcement['priority']): BadgeProps['variant'] => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  }

  if (!isAuthorized) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Comunicação Interna</h1>
        <p className="text-muted-foreground">Envie comunicados e troque mensagens com a equipe.</p>
      </div>

      <Tabs defaultValue="announcements">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
                <TabsTrigger value="announcements">Comunicados</TabsTrigger>
                <TabsTrigger value="messages">Gerador de Diálogo (IA)</TabsTrigger>
            </TabsList>
            {canPublish && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                      <Button className="w-full sm:w-auto">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Novo Comunicado
                      </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                      <DialogTitle>Criar Novo Comunicado</DialogTitle>
                      </DialogHeader>
                      <AnnouncementForm onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} />
                  </DialogContent>
              </Dialog>
            )}
        </div>

        <TabsContent value="announcements" className="mt-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                {announcements.map((item) => (
                    <Card key={item.id}>
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline">{item.title}</CardTitle>
                                    <CardDescription>
                                        Publicado em {new Date(item.date + "T00:00:00").toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                                    </CardDescription>
                                </div>
                                 <Badge variant={getPriorityVariant(item.priority)} className="capitalize">
                                    {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                                 </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-base text-foreground/80 leading-relaxed">
                            {item.content}
                        </CardContent>
                        <CardFooter className="gap-2">
                             {item.categories.map(category => (
                                <Badge key={category} variant="secondary">{category}</Badge>
                             ))}
                        </CardFooter>
                    </Card>
                ))}
                 {announcements.length === 0 && (
                    <Card className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                        <MessageSquare className="h-12 w-12" />
                        <p>Nenhum comunicado encontrado.</p>
                    </Card>
                )}
            </div>
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Bot className="h-6 w-6 text-primary" /> Gerador de Diálogo com IA</CardTitle>
                    <CardDescription>Selecione dois funcionários e descreva um cenário para gerar um exemplo de conversa profissional.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select value={user1} onValueChange={setUser1}>
                            <SelectTrigger><SelectValue placeholder="Selecione o Funcionário 1" /></SelectTrigger>
                            <SelectContent>{employeeList.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={user2} onValueChange={setUser2}>
                            <SelectTrigger><SelectValue placeholder="Selecione o Funcionário 2" /></SelectTrigger>
                            <SelectContent>{employeeList.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <Input 
                            placeholder="Opcional: Descreva um cenário (ex: feedback de desempenho)" 
                            value={scenario}
                            onChange={(e) => setScenario(e.target.value)}
                        />
                        <Button onClick={handleGenerateConversation} disabled={isLoading || !user1 || !user2} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            Gerar Conversa
                        </Button>
                    </div>
                     {(isLoading || conversation) && (
                        <Card className="bg-muted/50">
                        <CardContent className="p-4">
                            {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                            ) : (
                            <p className="text-sm whitespace-pre-wrap">{conversation}</p>
                            )}
                        </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

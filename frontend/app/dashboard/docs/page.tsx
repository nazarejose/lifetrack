"use client"

import { FileText, FolderOpen, Search, Plus, MoreHorizontal, Download, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const documents = [
  { id: 1, name: "LifeTrack PRD", type: "doc", size: "2.4 MB", modified: "15 Mar 2024", category: "Documentos" },
  { id: 2, name: "Orçamento 2024", type: "sheet", size: "1.2 MB", modified: "14 Mar 2024", category: "Finanças" },
  { id: 3, name: "Metas do Ano", type: "doc", size: "856 KB", modified: "10 Mar 2024", category: "Pessoal" },
  { id: 4, name: "Relatório Mensal", type: "pdf", size: "3.1 MB", modified: "08 Mar 2024", category: "Relatórios" },
  { id: 5, name: "Plano de Estudos", type: "doc", size: "512 KB", modified: "05 Mar 2024", category: "Educação" },
  { id: 6, name: "Receitas Favoritas", type: "doc", size: "1.8 MB", modified: "01 Mar 2024", category: "Pessoal" },
]

const folders = [
  { id: 1, name: "Documentos", count: 12, color: "bg-chart-1" },
  { id: 2, name: "Finanças", count: 8, color: "bg-chart-2" },
  { id: 3, name: "Pessoal", count: 15, color: "bg-chart-3" },
  { id: 4, name: "Trabalho", count: 6, color: "bg-chart-4" },
]

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground">Organize seus arquivos e documentos</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Pastas</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${folder.color}/20`}>
                    <FolderOpen className={`h-5 w-5 text-${folder.color.replace("bg-", "")}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-card-foreground">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">{folder.count} arquivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Documentos Recentes</CardTitle>
          <CardDescription className="text-muted-foreground">Arquivos acessados recentemente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden md:table-cell">Tamanho</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden lg:table-cell">Modificado</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium text-card-foreground">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">{doc.category}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden md:table-cell">{doc.size}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden lg:table-cell">{doc.modified}</td>
                    <td className="py-3 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem className="text-popover-foreground">
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-popover-foreground">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

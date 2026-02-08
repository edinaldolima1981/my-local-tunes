import { motion } from 'framer-motion';
import { ChevronLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Shield size={24} className="text-primary" />
                        <h1 className="text-xl font-bold">Política de Privacidade</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(100vh-80px)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container max-w-4xl mx-auto px-4 py-8 space-y-6"
                >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-muted-foreground">
                            <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                        </p>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
                            <p>
                                O VibePlayer ("nós", "nosso" ou "app") respeita sua privacidade e está
                                comprometido em proteger seus dados pessoais. Esta Política de Privacidade
                                explica como coletamos, usamos e protegemos suas informações.
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">2. Dados Coletados</h2>
                            <p>O VibePlayer é um aplicativo <strong>100% offline</strong>. Coletamos apenas:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Arquivos de Mídia:</strong> Músicas e vídeos que você escolhe importar
                                    são armazenados localmente no seu dispositivo.
                                </li>
                                <li>
                                    <strong>Metadados de Mídia:</strong> Informações como título, artista, álbum e
                                    duração são extraídos dos arquivos que você importa.
                                </li>
                                <li>
                                    <strong>Preferências do Usuário:</strong> Suas configurações, playlists e álbuns
                                    personalizados são salvos localmente no dispositivo.
                                </li>
                            </ul>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Seus Dados</h2>
                            <p>Todos os dados são usados exclusivamente para:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Reproduzir suas músicas e vídeos</li>
                                <li>Organizar sua biblioteca de mídia</li>
                                <li>Lembrar suas preferências e configurações</li>
                                <li>Funcionalidade offline do aplicativo</li>
                            </ul>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">4. Armazenamento de Dados</h2>
                            <p>
                                <strong>Todos os seus dados são armazenados localmente</strong> no seu dispositivo
                                usando:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>IndexedDB para arquivos de mídia</li>
                                <li>localStorage para preferências e metadados</li>
                            </ul>
                            <p className="mt-2">
                                <strong>Nenhum dado é enviado para servidores externos.</strong>
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
                            <p>
                                O VibePlayer <strong>NÃO compartilha, vende ou transfere</strong> seus dados para terceiros.
                                Não coletamos informações pessoais identificáveis e não usamos serviços de análise ou rastreamento.
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">6. Permissões Necessárias</h2>
                            <p>O aplicativo solicita as seguintes permissões:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Armazenamento/Arquivos:</strong> Para acessar e reproduzir seus arquivos
                                    de música e vídeo
                                </li>
                                <li>
                                    <strong>Biblioteca de Mídia:</strong> Para ler metadados (título, artista, etc.)
                                    dos arquivos de mídia
                                </li>
                            </ul>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">7. Segurança</h2>
                            <p>
                                Como o aplicativo funciona completamente offline e todos os dados são armazenados
                                localmente no seu dispositivo, a segurança dos seus dados depende das medidas de
                                segurança do próprio dispositivo (senha, biometria, criptografia do sistema).
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">8. Seus Direitos</h2>
                            <p>Você tem total controle sobre seus dados:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Excluir músicas, álbuns ou playlists a qualquer momento</li>
                                <li>Limpar todos os dados do app através das configurações do dispositivo</li>
                                <li>Desinstalar o app, removendo automaticamente todos os dados locais</li>
                            </ul>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">9. Menores de Idade</h2>
                            <p>
                                O VibePlayer pode ser usado por pessoas de todas as idades. Não coletamos
                                intencionalmente informações pessoais de menores de 13 anos.
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">10. Alterações nesta Política</h2>
                            <p>
                                Podemos atualizar esta Política de Privacidade periodicamente. Recomendamos revisar
                                esta página ocasionalmente para estar ciente de quaisquer alterações.
                            </p>
                        </section>

                        <section className="mt-6">
                            <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
                            <p>
                                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:
                            </p>
                            <p className="mt-2">
                                <strong>Email:</strong> privacy@vibeplayer.app<br />
                                <strong>Website:</strong> www.vibeplayer.app
                            </p>
                        </section>
                    </div>
                </motion.div>
            </ScrollArea>
        </div>
    );
}

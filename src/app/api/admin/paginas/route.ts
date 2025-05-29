import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Função para obter todas as páginas do app
export async function GET() {
  try {
    const appDir = path.join(process.cwd(), 'src/app');
    const ignoreDirs = ['api', 'dashboard', 'lib', 'components', '(auth)', '_components', 'fonts'];
    
    // Lista para armazenar as páginas encontradas
    const paginas = [];
    
    // Função para verificar se um diretório é uma página
    const isPaginaDir = (dir: string) => {
      const fullPath = path.join(appDir, dir);
      if (!fs.statSync(fullPath).isDirectory()) return false;
      if (dir.startsWith('_') || dir.startsWith('.')) return false;
      if (ignoreDirs.includes(dir)) return false;
      return true;
    };
    
    // Função para obter informações sobre uma página
    const getPaginaInfo = (dir: string) => {
      const fullPath = path.join(appDir, dir);
      const files = fs.readdirSync(fullPath);
      
      // Verifica se existe um arquivo page.tsx ou page.js
      const hasPage = files.some(file => file === 'page.tsx' || file === 'page.js');
      if (!hasPage) return null;
      
      // Tenta encontrar informações sobre a página
      let titulo = dir.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      if (dir === '') titulo = 'Página Inicial';
      
      return {
        id: dir || 'home',
        titulo: titulo,
        slug: `/${dir}`,
        path: fullPath,
        status: 'PUBLICADA',
        autor: 'Sistema',
        template: 'Padrão',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    };
    
    // Obter diretórios do primeiro nível
    const dirs = ['', ...fs.readdirSync(appDir)];
    
    // Processar cada diretório
    for (const dir of dirs) {
      if (dir === '' || isPaginaDir(dir)) {
        const paginaInfo = getPaginaInfo(dir);
        if (paginaInfo) {
          paginas.push(paginaInfo);
        }
      }
    }
    
    return NextResponse.json(paginas);
  } catch (error) {
    console.error('Erro ao buscar páginas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar páginas' },
      { status: 500 }
    );
  }
}

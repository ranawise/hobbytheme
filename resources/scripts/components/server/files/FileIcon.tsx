import React from 'react';
import {
    Folder,
    FileCog,
    FileArchive,
    FileSymlink,
    File as FileIconBase,
    FileCode,
    FileText,
    Terminal,
    Database,
    Image,
    Music,
    Globe,
} from 'lucide-react';
import tw from 'twin.macro';
import { FileObject } from '@/api/server/files/loadDirectory';

const CONFIG_EXT  = /\.(json|ya?ml|toml|properties|cfg|conf|ini|env|envrc)$/i;
const LOG_EXT     = /\.log(\.\d+)?$|\.log$/i;
const SCRIPT_EXT  = /\.(sh|bash|zsh|fish|ps1|bat|cmd)$/i;
const CODE_EXT    = /\.(js|jsx|ts|tsx|py|java|jar|class|rb|php|go|rs|c|cpp|cc|h|hpp|cs|swift|kt|lua|pl|r|scala|groovy)$/i;
const WEB_EXT     = /\.(html|htm|css|scss|sass|less|xml|svg|vue|svelte|hbs|ejs|pug|twig)$/i;
const DB_EXT      = /\.(sql|db|sqlite|sqlite3|mdb|accdb)$/i;
const TEXT_EXT    = /\.(txt|md|rst|nfo|readme|license|changelog)$/i;
const IMAGE_EXT   = /\.(png|jpe?g|gif|webp|ico|bmp|tiff?|avif|psd)$/i;
const AUDIO_EXT   = /\.(mp3|wav|ogg|flac|aac|m4a|opus)$/i;

export default ({ file, size = 16 }: { file: FileObject; size?: number }) => {
    if (!file.isFile) {
        return <Folder size={size} css={tw`text-yellow-400`} />;
    }

    if (file.isSymlink) {
        return <FileSymlink size={size} css={tw`text-neutral-500`} />;
    }

    if (file.isArchiveType()) {
        return <FileArchive size={size} css={tw`text-neutral-400`} />;
    }

    if (LOG_EXT.test(file.name)) {
        return <FileText size={size} css={tw`text-neutral-500`} />;
    }

    if (CONFIG_EXT.test(file.name)) {
        return <FileCog size={size} css={tw`text-primary-400`} />;
    }

    if (SCRIPT_EXT.test(file.name)) {
        return <Terminal size={size} css={tw`text-green-400`} />;
    }

    if (DB_EXT.test(file.name)) {
        return <Database size={size} css={tw`text-cyan-400`} />;
    }

    if (WEB_EXT.test(file.name)) {
        return <Globe size={size} css={tw`text-purple-400`} />;
    }

    if (CODE_EXT.test(file.name)) {
        return <FileCode size={size} css={tw`text-blue-400`} />;
    }

    if (IMAGE_EXT.test(file.name)) {
        return <Image size={size} css={tw`text-pink-400`} />;
    }

    if (AUDIO_EXT.test(file.name)) {
        return <Music size={size} css={tw`text-cyan-300`} />;
    }

    if (TEXT_EXT.test(file.name)) {
        return <FileText size={size} css={tw`text-neutral-400`} />;
    }

    return <FileIconBase size={size} css={tw`text-neutral-600`} />;
};

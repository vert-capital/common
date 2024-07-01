# Apaga o node_modules no diretório raiz
rm -rf ./node_modules
# Apaga o pnpm-lock.yaml no diretório raiz
rm -rf ./pnpm-lock.yaml
# Apaga todos os node_modules nos subdiretórios
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
# Apaga todos os dist nos subdiretórios
find . -name "dist" -type d -prune -exec rm -rf '{}' +
# Apaga todos os build nos subdiretórios
find . -name "build" -type d -prune -exec rm -rf '{}' +
# Apaga todos os .cache nos subdiretórios
find . -name ".cache" -type d -prune -exec rm -rf '{}' +
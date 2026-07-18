/**
 * Tag and print release notes for NightTable CO.
 * Usage: node scripts/release.mjs 1.6.0
 * Does not push by default — prints git commands.
 */
const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node scripts/release.mjs <semver>  e.g. 1.6.0");
  process.exit(1);
}

const tag = `v${version}`;
console.log(`
NightTable CO release helper
============================
Version: ${version}
Tag:     ${tag}

1) Ensure main is green and CHANGELOG has [${version}]
2) Commit any remaining release notes
3) Run:

   git checkout main
   git pull origin main
   git tag -a ${tag} -m "NightTable CO ${tag}"
   git push origin main --tags

4) Optional GitHub release:

   gh release create ${tag} --title "NightTable CO ${tag}" --notes-file CHANGELOG.md

5) Deploy (Render blueprint / Railway) then:

   npm run check:prod-env
   npm run db:migrate -w @saas/db
   npm run make-superadmin -- ops@yourdomain.com
`);

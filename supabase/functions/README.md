# Edge functions

claude-proxy and code-exec live in Celeritas7/Akatsuki supabase/functions/ (main). Copy from there and deploy each with --no-verify-jwt. Never deploy an older copy: claude-proxy's x-cs-secret check and 200-calls-a-day cap exist only in the Akatsuki version.

To change either function, open the change in Akatsuki (or send the hub session the diff). Don't keep a fork here.

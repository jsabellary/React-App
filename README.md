FlightFinderReact

Projects
- FlightFinder.Server (.NET 8 API)
- FlightFinder.Shared (.NET Standard 2.1 models)
- FlightFinder.React (Vite + React 18 + TS UI)

Local development
- Server
  - dotnet build FlightFinder.Server
  - dotnet run --project FlightFinder.Server
- React (dev)
  - cd FlightFinder.React
  - npm install
  - npm run dev

Vite proxy
- Dev proxy points to http://localhost:52875 (see FlightFinder.React/vite.config.ts)

Production build
- React build with API base URL
  - On PowerShell: $env:VITE_API_BASE = "https://your-api-host"; npm run build
  - On bash: VITE_API_BASE=https://your-api-host npm run build
  - Output: FlightFinder.React/dist
- Server publish
  - dotnet publish FlightFinder.Server -c Release -r linux-x64 -o publish

CORS
- Server currently allows any origin. Lock this down before production by replacing AllowAnyOrigin with your CloudFront/SPA domain.

Deploy (AWS free tier friendly)
- React: S3 static website + CloudFront
- Server: Elastic Beanstalk single-instance (t2.micro/t4g.micro)

Repo tips
- Keep these three projects together; Server references Shared.
- The legacy Blazor Client is not required for this repo.

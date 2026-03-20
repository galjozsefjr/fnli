# Fictional Numbers Lottery Inc. - Lottery Simulator

## Prerequisites
These tools will be needed to be available on your machine:
- Node.js 24+
- Docker
- yarn 1.22+

## Production environment
!! **Known issue:** API build failure due to misconfiguration !!
- Create a `.env` file based on `.env.example` in the root directory. The application will use these defined parameters.
- Run command: `docker-compose up` - it builds a production-ready environment
- Run command: `docker exec -it api yarn migration:run` - if fails run manually from `apps/api` with `yarn migration:run` - see Development environment setup
- When finished open your browser at [http://localhost:8080](http://localhost:8080)

## Development environment
To get a development environment please follow these steps:
- Create a `.env` file based on `.env.example` in `apps/api` directory.
- Create a `.env` file containing one line: `API_URL=http://localhost:3001` in `apps/web` directory.
- Run `yarn install` on the root directory.
- Start `db` section in the docker-compose.yml: `docker-compose up -d --build 'db'`
- Run `yarn migration` command from the root directory
- Run `yarn dev` command on the root directory of the application.
- Open your browser at [http://localhost:3000](http://localhost:3000)

## Additional info
API documentation available on OAS format from a running environment on your machine at `/api` endpoint. (http://localhost:8080/api in prod or http://localhost:3001/api in dev mode)

## Todo list
- [ ] Finish job scheduler (feat/job-scheduler)
- [ ] Create architecture diagram

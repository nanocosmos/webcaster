# nanoStream Webcaster API release history and change log

## 6.2.3 (2025-09-26)


### Bug Fixes

* patch release e3157d6

## 6.2.2 (2025-09-22)


### Bug Fixes

* [wcr-336] improve error visibility 7ffa0be
* make default channelCount 2 ee2bc88
* renderErrorInStatus bf8a417
* renderErrorInStatus b6737c5
* updates copyright on package.json 816103c

# 6.2.0 (2024-07-15)


### Bug Fixes

* address Chrome bug in main sample where requested resolutions are too low 286761c
* assure webcasterId does not change per instance e70b0c8
* **ci:** update_public_repo remove freshen flag 828246c
* replace legacy resolution changed values with counter "resolutionChangeCount" 6ae64c6
* stop tracks of temporary MediaStream after it was created for device permissions request 4d47779


### Features

* improve error handling ea863e0
* improved metrics reporting of session lifetime f7032b0
* send metrics for status of MediaStream muted and document visibility e4af8a6

# 6.1.0 (2024-04-10)


### Bug Fixes

* calling dispose fails when server is not reachable 4f094b9
* **ci:** allow subsequent stages to be run after deploy c3dbaaa
* **ci:** make job branches coherent 3b3f7cd
* initially disabled tracks on the incoming mediaStream are enabled automatically 004df24
* isMuted method returns not the actual muted status, but passed isMuted config 03a557e


### Features

* add auto-reconnection f7947b6
* add onConnectionChange callback 7406317
* **readme:** add CI/CD header ea2f12e

## v6.0.2

First public release!

## v6.0.1

Minor improvements in documentation and samples.

## v6.0.0

Official release, see MIGRATION_GUIDE.md for details.

## v6.0.0-beta1

Our first version with the new API!

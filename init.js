//const appUrl = "http://localhost:4096";
//const baseURL = window.location.origin;
document.addEventListener("DOMContentLoaded", function () {
    import(new URL("./lib/common.js", baseURL)).then(function ({
        getFile,
        mapReviver,
        mapReplacer,
        query,
        joinPath,
    }) {
        getFile(searchParams.get("tasksFile"), {
            transformResponse: (response) => response,
            baseURL,
        })
            .then(function (response) {
                return JSON.parse(response.data, mapReviver);
            })
            .then(function (taskParamsMap) {
                //const paramsMap = query(taskParamsMap, taskPath);
                const taskPath = searchParams.get("taskPath");
                const paramsMap = new Map([
                    ...Array.from(searchParams.entries()),
                    ...query(taskParamsMap, taskPath),
                ]);
                /*
                             const paramsMap = new Map([
                                 ...Array.from(searchParams.entries()),
                                 ...Array.from(
                                     taskParamsMap.get(taskId).entries()
                                 ),
                             ]);
            */
                //paramsMap.set("taskId", taskId);
                paramsMap.set("baseURL", baseURL);
                //paramsMap.set("taskParamsMap", taskParamsMap);
                paramsMap.set("seed", seed);
                init(paramsMap, function (message) {
                    if (message.action === "submit") {
                        fetch(
                            `${appUrl}?action=submit&json=${encodeURIComponent(
                                JSON.stringify({
                                    modelDataJson: JSON.stringify(message.data),
                                    correct:
                                        message?.model?.children?.get(
                                            "feedback"
                                        )?.correct ?? "",
                                    paramsMapJson: JSON.stringify(
                                        paramsMap,
                                        mapReplacer
                                    ),
                                    taskPath: `${joinPath(
                                        taskPath,
                                        message.taskPath
                                    )}`,
                                })
                            )}`,
                            {
                                credentials: "include",
                                redirect: "follow",
                                mode: "no-cors",
                            }
                        );
                    } else if (message.action === "getSubmissions") {
                        const fullTaskPath = joinPath(
                            taskPath,
                            message.taskPath ?? ""
                        );
                        axios(
                            `${appUrl}?action=getSubmissions&taskPath=${fullTaskPath}`,
                            {
                                credentials: "include",
                                redirect: "follow",
                                mode: "no-cors",
                            }
                        ).then(function (response) {
                            message.update({
                                action: "loadSubmissions",
                                submissions: response.data,
                            });
                        });
                    } else if (message.action === "getTasks") {
                        Array.from(message.tasks.entries()).forEach(function ([
                            taskKey,
                            { taskPath },
                        ]) {
                            message.update({
                                action: "loadTask",
                                taskKey,
                                taskPath,
                                paramsMap: taskParamsMap.get(taskPath),
                            });
                        });
                    }
                    return Promise.resolve(message);
                });
            });
    });
});

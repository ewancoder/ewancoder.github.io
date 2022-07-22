## Thread pool - concurrency in .NET

In this article we are going to discuss the basics of concurrency in .NET Framework: how it works and how we can use it to create concurrent work.

[TOC]

> Make sure to check the [Introduction to concurrency](#/dev/concurrency/introduction/introduction) article if you want to know about the concurrency in general.

> The next article in this series is [Task](#/dev/concurrency/task/task) - all about `Task` abstraction in .NET.

### ThreadPool

A short summary from the previous article:

- Single core of CPU can only perform operations one by one
- OS uses **context switching** to switch between many threads and run operations from different threads on the same CPU core
- **CPU-bound** work is work that needs complete CPU attention, it cannot be parallelized more than to the amount of physical CPU cores
- **I/O-bound** work is work that doesn't need CPU, we can do it in as many threads as we want until we use up the I/O-bound bandwidth (e.g. network speed, if we are downloading many things at the same time)

When OS needs to run some work in parallel with already running other work, it:

- Creates a new **Thread** for it
- Then the work is executed on this thread, using context switching between all other threads if necessary
- After the work has been executed, the thread is deleted

Creation and deletion of OS Threads is expensive operation, it takes CPU and Memory resources, so we should avoid creating a thread whenever we can.

.NET Thread is an abstraction over OS Thread (usually), whenever you create a new .NET Thread - most likely a new OS thread would be requested from the OS. Furthermore, .NET objects for tracking the thread would need to be created and allocated in the memory, which creates even more overhead. All this means that we need to limit creating new threads as much as we can.

For this reason, .NET provides an abstraction called **Thread pool** from which we can request threads without the need to create them.

When you start a .NET process, it creates a pool for threads and instantiates a number of threads (something like 25 threads per core or so). These threads are available to us from the moment the program starts, till the end of the application's lifetime.

So, when you need to schedule some work on another thread, you ask the thread pool to give you any thread that is currently free, and you schedule the work on this thread. After the work is done, the thread becomes free and is returned to the thread pool so it can be reused by another piece of work.

> All following examples in these articles are using .NET 6 C# 10 features including [top-level statements](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements), [implicit usings](https://dotnetcoretutorials.com/2021/08/31/implicit-using-statements-in-net-6/) and [nullable reference types](https://docs.microsoft.com/en-us/dotnet/csharp/nullable-references).

To queue some work on the thread pool, you can use the following method:

```csharp
ThreadPool.QueueUserWorkItem(Work);

void Work(object? state)
{
    // Do something on another thread.
    Console.WriteLine("Doing something on another thread.");
}
```

If you run this, you'll see that nothing gets printed into the console and program instantly exits. This is because by default all threads on the thread pool are *background threads*. When the main application's thread exits, the application doesn't wait for all background threads to finish, it kills them all and stops the application.

To fix this, let's add a single `Console.ReadLine();` statement to block the main thread until user presses Enter key:

```csharp
ThreadPool.QueueUserWorkItem(Work);
Console.ReadLine();

void Work(object? state)
{
    // Do something on another thread.
    Console.WriteLine("Doing something on another thread.");
}
```

Now we see this in the output:

```console
Doing something on another thread.
```

Let's improve our console writer a bit, to give us more insight for future examples. Let's create a method that will print the message to console, also telling us from which thread we got the reply.

```csharp
public static class Logger
{
    public static void Log(string message)
    {
        var threadId = Thread.CurrentThread.ManagedThreadId;

        Console.WriteLine($"Thread {threadId}: {message}");
    }
}
```

And let's rewrite our example to this, adding some more logging:

```csharp
hl=1,3,9
Logger.Log("Started program");
ThreadPool.QueueUserWorkItem(Work);
Logger.Log("Scheduled work on a separate thread");

Console.ReadLine();

void Work(object? state)
{
    Logger.Log("Doing something on another thread.");
}
```

Now if we run this, we are going to get the following output:

```console
Thread 1: Started program
Thread 1: Scheduled work on a separate thread
Thread 6: Doing something on another thread.
```

You might have a different number in place of `6`, but what's important is that it is different from the thread `1` on which our main method executes. In theory, you might even get `6` before the second `1` line, because as soon as we schedule the work on another thread - a thread is being picked up from the thread pool and the work is being executed there. If our second Log statement from the main thread was taking a long time to execute, the statement from the `Work` method might have been executed faster.

Note that here we did not create or destroyed any threads. When application started, it created a number of threads for us and placed them in the **Thread pool**. We asked the thread pool to queue some work for us, and it got executed on one of the free threads off the thread pool, not spending time on creaton and deletion of any threads. As soon as our `Work` method is done, thread `6` is free and is returned to thread pool, so that it can be reused later by any other code that we might queue on the thread pool.

The `QueueUserWorkItem` accepts a delegate that accepts `object? state` object, which can be used to pass the state inside our method that needs to be executed on another thread.

Let's tweak our program to send the state to another thread:

```csharp
hl=3,5,14-15
Logger.Log("Started program");

var hello = "Hello!";

ThreadPool.QueueUserWorkItem(Work, hello);
Logger.Log("Scheduled work on a separate thread");

Console.ReadLine();

void Work(object? state)
{
    Logger.Log("Doing something on another thread.");

    if (state != null)
        Logger.Log($"{state}");
}
```

Now we are using Thread 6 to print the state that we created in Thread 1:

```console
Thread 1: Started program
Thread 1: Scheduled work on a separate thread
Thread 6: Doing something on another thread.
Thread 6: Hello!
```

> If you need to reduce amount of allocations or improve performance, make sure that whenever you are scheduling work on the thread pool - all the necessary data is being passed using **only** the `state` parameter. If a delegate references a variable outside its scope, it leads to creation of a closure, increasing number of allocations and decreasing performance.

### QueueUserWorkItem limitations

The method `QueueUserWorkItem` has one serious limitation: it returns `bool` result which denotes whether scheduling operation was successful or no (it would almost always be `true`) and there's no way to track our separate thread from the main one.

What if we want to wait in the main thread until the background thread finishes its job before continuing? What if our background job fails and throws some exception? There's no way for us to find out whether our thread finished successfully or no, and we cannot influence the execution of the background job in any way.

If we must use `QueueUserWorkItem` method, we need to make sure that it will never fail. We need to include a try/catch block inside `Work` method, and handle exception within another thread. What if we need data from the current thread to handle the exception?

.NET provides a better abstraction for us: `Task`.

### Task

Starting from .NET 4, we have a much better, universal abstraction for concurrent operations: **Task**. **Task** is a class that encapsulates all the logic needed to schedule a piece of work on the thread pool, to track it's status and to allow querying the result and/or handling exceptions.

> **Task** is an abstraction over a piece of work that needs to be done, not over some particular thread. In fact, single Task can run its job on many different threads, switching between them if needed, as well as just waiting without using any threads at all. We'll get down to it later.

The following pieces of code are completely identical in how they work, and I would encourage everyone to use the second one.

```csharp
// Queuing work on thread pool.
ThreadPool.QueueUserWorkItem(Work);
Console.ReadLine();

void Work(object? state)
{
    Logger.Log("Doing something on another thread.");
}



// Queuing work on thread pool.
Task.Run(WorkForTask);
Console.ReadLine();

void WorkForTask()
{
    Logger.Log("Doing something on another thread.");
}
```

`Task.Run` method accepts `Action` delegate, so as you can see there's no need to pass the state object. Furthermore, the result of the `Run` method is a `Task` object which contains all information about the running job. We can save it into the variable and wait for a result later.

> If you still care about performance and you need to avoid allocations, you can use `TaskFactory` static class which allows creating Tasks with many different options, as well as specifying `state` object that we used with `QueueUserWorkItem` method to avoid closure allocations.

```csharp
Logger.Log("Started application");

var task = Task.Run(WorkForTask);

Logger.Log("Created task");

task.Wait();

Logger.Log("Finished waiting for task");

void WorkForTask()
{
    Logger.Log("Doing something on another thread.");
}
```

`Wait()` method **blocks** current thread and waits until the job that is executing within the task stored in the variable `task` is finished. Only after it has finished, the execution of the main is continued. **Blocking** the thread means that the thread is waiting without doing anything. Usually we want to avoid blocking threads, but in this example we are blocking the main thread instead of using `Console.ReadLine()`, so that application doesn't exit until our task finishes execution, which is completely fine.

Once we run this, we'll get the following output:

```console
Thread 1: Started application
Thread 1: Created task
Thread 6: Doing something on another thread.
Thread 1: Finished waiting for task
```

Tasks are the main building block of concurrency in .NET, they have many useful properties so you can build sophisticated asynchronous flows with ease, abstracting away from the underlying threads implementation.

In the next article, we are going to cover the most important aspects of a `Task`, and how we can use it in .NET.
## Thread pool - concurrency in .NET

In this article we are going to discuss the basics of concurrency in .NET Framework: how it works and how we can use it to create concurrent work.

[TOC]

> Make sure to check the [Introduction to concurrency](#/dev/concurrency/introduction/introduction) article if you want to know about the concurrency in general.

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

To queue some work on the thread pool, you can use the following method:

```csharp
public void Main()
{
    ThreadPool.QueueUserWorkItem(work);
}
```

### WIP
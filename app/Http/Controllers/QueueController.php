<?php

namespace App\Http\Controllers;

use App\Http\Requests\QueueRequest;
use App\Models\Doctor;
use App\Models\Queue;
use App\Services\QueueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;

class QueueController extends Controller
{
    public function __construct(
        protected QueueService $service,
    ) {}

    public function index(Request $request)
    {
        $date = $request->input('date', Date::today()->toDateString());
        $doctorId = $request->input('doctor_id');

        $queue = $doctorId
            ? $this->service->getByDateAndDoctor($date, $doctorId)
            : $this->service->getByDate($date);

        return Inertia::render('queue/index', [
            'queue' => $queue,
            'date' => $date,
            'doctors' => Doctor::with('user')->where('is_active', true)->get(['id', 'user_id', 'specialization']),
            'filters' => $request->only(['date', 'doctor_id']),
        ]);
    }

    public function store(QueueRequest $request)
    {
        $this->service->addToQueue($request);

        return redirect()->back()->with('success', 'Patient added to queue.');
    }

    public function update(Request $request, Queue $queue)
    {
        $this->service->update($queue->id, $request);

        return redirect()->back()->with('success', 'Queue entry updated.');
    }

    public function destroy(Queue $queue)
    {
        $this->service->delete($queue->id);

        return redirect()->back()->with('success', 'Patient removed from queue.');
    }

    public function call(Queue $queue)
    {
        $this->service->callNext($queue->id);

        return redirect()->back()->with('success', 'Patient called.');
    }

    public function complete(Queue $queue)
    {
        $this->service->markCompleted($queue->id);

        return redirect()->back()->with('success', 'Patient marked as completed.');
    }

    public function noShow(Queue $queue)
    {
        $this->service->markNoShow($queue->id);

        return redirect()->back()->with('success', 'Patient marked as no show.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'date' => ['required', 'date'],
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:queues,id'],
        ]);

        $this->service->reorder($request->input('date'), $request->input('ordered_ids'));

        return redirect()->back()->with('success', 'Queue reordered.');
    }
}

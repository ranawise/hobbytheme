@extends('layouts.admin')

@section('title')
    Server — {{ $server->name }}: Plan
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>Assign this server to a different resource Plan.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.servers') }}">Servers</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">Plan</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <div class="col-sm-8">
        <form action="{{ route('admin.servers.view.plan', $server->id) }}" method="POST">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Resource Plan</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label for="pPlanId" class="control-label">Plan</label>
                        <select name="plan_id" id="pPlanId" class="form-control">
                            @foreach ($plans as $plan)
                                <option value="{{ $plan->id }}" @if($server->plan_id === $plan->id) selected @endif>
                                    {{ $plan->name }} — {{ $plan->memory }} MB memory, {{ $plan->disk }} MB disk, {{ $plan->cpu }}% CPU ({{ $plan->credit_cost }} credits/month){{ !$plan->visible ? ' [hidden]' : '' }}
                                </option>
                            @endforeach
                        </select>
                        <p class="text-muted small">
                            Switching takes effect immediately and applies the new Plan's resource limits to this
                            server. <strong>No credits are charged or refunded</strong> — this is an administrative
                            override, separate from the player-facing Plan switch which prorates a credit
                            charge/refund. The server's billing cycle resets to start 30 days from today, and any
                            non-payment suspension on this server is cleared.
                        </p>
                    </div>
                    @if ($server->plan)
                        <p class="text-muted small no-margin">
                            Currently on <strong>{{ $server->plan->name }}</strong>, next billed
                            {{ $server->plan_renews_at?->toFormattedDateString() ?? 'n/a' }}.
                        </p>
                    @else
                        <p class="text-muted small no-margin">This server is not currently on a Plan.</p>
                    @endif
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button type="submit" class="btn btn-primary pull-right">Update Plan</button>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
